import { Prisma, PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function events() {
  const prisma = new PrismaClient();
  const eventDetails = await readFile('src/utils/scripts/dm/UpsertEvent.csv');
  const eventInfo = await parsePromise(eventDetails, {
    columns: true,
  });
  const temple = await prisma.temple.findUnique({
    where: { templeId: 'Temple-1' },
  });
  let service: Prisma.ServiceCreateManyServiceTypeInput;
  const eventObj = {};
  eventInfo.forEach((it) => {
    if (!eventObj[it.serviceType]) {
      eventObj[it.serviceType] = {
        type: it.serviceType,
        services: [],
      };
      service = {
        title: it.serviceTitle,
        description: it.description,
        time: JSON.parse(it.time) as Prisma.JsonObject,
        // occurenceType: JSON.parse(it.occurenceType),
        occurence: JSON.parse(it.occurence) as Prisma.JsonArray,
        season: JSON.parse(it.season) as Prisma.JsonObject,
        config: JSON.parse(it.config) as Prisma.JsonObject,
        price: parseFloat(it.price),
        prebookCutOff: Number(it.prebookCutOff),
        currency: it.currency,
        templeId: temple.id,
        note: it.note,
      };
      eventObj[it.serviceType].services.push(service);
    } else {
      service = {
        title: it.serviceTitle,
        description: it.description,
        time: JSON.parse(it.time) as Prisma.JsonObject,
        // occurenceType: JSON.parse(it.occurenceType),
        occurence: JSON.parse(it.occurence) as Prisma.JsonArray,
        season: JSON.parse(it.season) as Prisma.JsonObject,
        config: JSON.parse(it.config) as Prisma.JsonObject,
        price: parseFloat(it.price),
        prebookCutOff: Number(it.prebookCutOff),
        currency: it.currency,
        templeId: temple.id,
        note: it.note,
      };
      eventObj[it.serviceType].services.push(service);
    }
  });

  for (const event of Object.values(eventObj)) {
    let data = event as any;
    let serviceType = await prisma.serviceType.findFirst({
      where: { type: data.type },
    });
    if (!serviceType) {
      serviceType = await prisma.serviceType.create({
        data: {
          type: data.type,
        },
      });
      console.log('Event created >>>', serviceType.type);
    }
    for (const service of data.services) {
      const result = await prisma.service.findFirst({
        where: { title: service.title, serviceTypeId: serviceType.id },
      });
      if (result) {
        await prisma.service.update({
          where: { id: result.id },
          data: {
            title: service.title,
            description: service.description,
            time: service.time,
            // occurenceType: JSON.parse(service.occurenceType),
            occurence: service.occurence,
            season: service.season,
            config: service.config,
            price: service.price,
            prebookCutOff: Number(service.prebookCutOff),
            currency: service.currency,
            note: service.note,
            temple: { connect: { id: service.templeId } },
            ServiceType: { connect: { id: serviceType.id } },
          },
        });
        console.log(`Service updated >>>`, service.title);
      } else {
        await prisma.service.create({
          data: {
            title: service.title,
            description: service.description,
            time: service.time,
            // occurenceType: JSON.parse(service.occurenceType),
            occurence: service.occurence,
            season: service.season,
            config: service.config,
            price: service.price,
            prebookCutOff: Number(service.prebookCutOff),
            currency: service.currency,
            note: service.note,
            temple: { connect: { id: service.templeId } },
            ServiceType: { connect: { id: serviceType.id } },
          },
        });
        console.log(`Service created >>>`, service.title);
      }
    }
  }
}
events();
