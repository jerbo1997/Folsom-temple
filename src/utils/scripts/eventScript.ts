import { Prisma, PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function events() {
  const prisma = new PrismaClient();
  const eventDetails = await readFile('src/utils/scripts/dm/events.csv');
  const eventInfo = await parsePromise(eventDetails, {
    columns: true,
  });
  const temple = await prisma.temple.findUnique({
    where: { templeId: 'Temple-1' },
  });
  let service: Prisma.ServiceCreateManyServiceTypeInput;
  let eventObj = {};
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
        occurenceType: JSON.parse(it.occurenceType),
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
        occurenceType: JSON.parse(it.occurenceType),
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

  for (let data of Object.values(eventObj)) {
    let serviceType = data as any;
    await prisma.serviceType.create({
      data: {
        type: serviceType.type,
        services: { createMany: { data: serviceType.services } },
      },
    });
    console.log('>>>>>>>>>> events created', serviceType.type);
  }
  const currentDate = new Date();
  const nextDayDate = new Date(currentDate);
  nextDayDate.setDate(currentDate.getDate() + 1);
  await prisma.config.create({
    data: {
      serviceCronStart: currentDate.toISOString(),
      serviceNextCron: nextDayDate.toISOString(),
    },
  });
}
events();
