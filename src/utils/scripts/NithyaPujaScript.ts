import { Prisma, PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);
export async function nithyaPuja() {
  try {
    const prisma = new PrismaClient();
    const pujaDetails = await readFile('src/utils/scripts/dm/NithyaPuja.csv');
    const pujaInfo = await parsePromise(pujaDetails, { columns: true });
    const pujaData = [];
    const service = await prisma.service.findFirst({
      where: { title: 'Nithya Puja' },
    });

    for (const input of pujaInfo) {
      const dateString = input['Booking Date'];
      const [day, month, year] = dateString.split('-');
      const updatedDate = new Date(`${year}-${month}-${day}`);
      updatedDate.setHours(0, 0, 0, 0);

      const user = await prisma.user.findFirst({
        where: { mobile: input['Mobile'] },
      });
      const data: Prisma.PremiumBookingsCreateInput = {
        registrationNo: Number(input['Registration No']),
        title: input['Title'],
        devoteeName: input['Devotee Name'],
        address: {
          create: {
            name: input['Devotee Name'],
            mobile: input['Mobile'],
            addressLine1: input['Address 1'],
            addressLine2: input['Address 2'],
            pinCode: input['Pin Code'],
            city: input['City'],
            state: input['State'],
            country: input['Country'],
          },
        },
        user: user
          ? { connect: { id: user.id } }
          : {
              create: {
                name: input['Name'],
                mobile: input['Mobile'],
                star: input['Star'],
                rasi: input['Rasi'],
                gothram: input['Gothram'],
                email: input['Email'],
                countryCode: input['Country Code'],
              },
            },
        temple: { connect: { templeId: 'Temple-1' } },
        service: { connect: { id: service.id } },
        deityName: input['Choice Of Deity'],
        date: input['Tamil Month'] ? undefined : Number(input['Date']),
        englishMonth: input['Tamil Month']
          ? undefined
          : Number(input['English Month']),
        tamilMonth: input['Tamil Month'] || undefined,
        bookingDate: updatedDate,
        rptNo: Number(input['RPT No']),
        amount: Number(input['Amount']),
        occasion: input['Occasion'],
      };
      const puja = await prisma.premiumBookings.create({ data });
      console.log('Puja created successfully');
    }
  } catch (error) {
    console.log(error);
  }
}

nithyaPuja();
