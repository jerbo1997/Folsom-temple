import { Prisma, PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { AnyARecord } from 'dns';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);
export async function date() {
  try {
    const prisma = new PrismaClient();
    const dateDetails = await readFile('src/utils/scripts/dm/date.csv');
    const info = await parsePromise(dateDetails, { columns: true });
    let dateData = [];

    for (let input of info) {
      const updatedMonth = String(input['Month']).padStart(2, '0');
      const updatedDay = String(input['Date']).padStart(2, '0');
      let date = new Date(`${input['Year']}-${updatedMonth}-${updatedDay}`);
      let updatedDate = new Date(date.setHours(0, 0, 0, 0));
      const data = {
        date: updatedDate,
        star: input['Star'],
        tamilMonth: input['Tamil Month'],
      };
      dateData.push(data);
    }
    const createdDate = await prisma.dateMap.createMany({ data: dateData });
    console.log('Date Created Successfully');
  } catch (error) {
    console.log(error);
  }
}
date();
