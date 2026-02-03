import { PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function donationService() {
  try {
    const prisma = new PrismaClient();
    const eventDetails = await readFile(
      'src/utils/scripts/dm/DonationService.csv',
    );
    const eventInfo = await parsePromise(eventDetails, { columns: true });
    const temple = await prisma.temple.findUnique({
      where: { templeId: 'Temple-1' },
    });
    let serviceType = await prisma.serviceType.findFirst({
      where: { type: 'Donation' },
    });
    if (!serviceType) {
      serviceType = await prisma.serviceType.create({
        data: {
          type: 'Donation',
        },
      });
    }
    let service = await prisma.service.findFirst({
      where: { title: 'Sastha Preethi' },
    });
    if (!service) {
      service = await prisma.service.create({
        data: {
          title: 'Sastha Preethi',
          occurence: [""],
          ServiceType: { connect: { id: serviceType.id } },
          temple: { connect: { id: temple.id } },
        },
      });
    }
    let serviceData = [];
    for (let input of eventInfo) {
      const data = {
        title: input.subService,
        price: parseFloat(input.price),
        currency: input.currency,
        occurence: [""],
        startDate: new Date(),
        endDate: new Date(input.endDate),
        parentServiceId: service.id,
      };
      serviceData.push(data);
    }
    const subservice = await prisma.service.createMany({ data: serviceData });
    console.log('DonationServices created successfully');
  } catch (error) {
    console.log(error);
  }
}
donationService();
