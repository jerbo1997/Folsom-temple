import { Prisma, PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function newsletters() {
  try {
    const prisma = new PrismaClient();
    const eventDetails = await readFile('src/utils/scripts/dm/NewsLetter.csv');
    const eventInfo = await parsePromise(eventDetails, { columns: true });
    const dbData = [];
    for (const input of eventInfo) {
      const data: Prisma.NewsLetterCreateInput = {
        title: input.title,
        description: input.description,
      };
      const imageUrls = [];
      const filesArray = JSON.parse(input.files.replace(/^"|"$/g, ''));
      for (const file of filesArray) {
        const base64String = file.split(';base64,')[1];
        const buffer = Buffer.from(base64String, 'base64');
        const image = file.match(/:(.*?);/);
        const result = image && image[1].split('/')[1];
        const uniqueFilename = uuidv4();
        const fileName = `${uniqueFilename}.${result}`;
        const imagePath = path.join(
          __dirname,
          `../../../public/newsLetter/${fileName}`,
        );
        await fs.promises.writeFile(imagePath, buffer);
        imageUrls.push(`newsLetter/${fileName}`);
      }
      if (imageUrls.length) {
        data.files = imageUrls;
      }
      dbData.push(data);
    }
    const newsLetters = await prisma.newsLetter.createMany({ data: dbData });
    console.log('Created NewsLetter:', newsLetters.count);
  } catch (error) {
    console.log(error);
  }
}
newsletters();
