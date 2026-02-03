import { Prisma, PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function deities() {
  try {
    const prisma = new PrismaClient();
    const eventDetails = await readFile('src/utils/scripts/dm/Deity.csv');
    const eventInfo = await parsePromise(eventDetails, { columns: true });
    const temple = await prisma.temple.findUnique({
      where: { templeId: 'Temple-1' },
    });
    for (let input of eventInfo) {
      const data: Prisma.DeityCreateInput = {
        title: input.title,
        description: input.description,
        temple: { connect: { id: temple.id } },
      };
      const base64String = input.imageUrl.split(';base64,')[1];
      const buffer = Buffer.from(base64String, 'base64');
      const image = input.imageUrl.match(/:(.*?);/);
      const result = image && image[1].split('/')[1];
      const uniqueFilename = uuidv4();
      const fileName = `${uniqueFilename}.${result}`;
      const imagePath = path.join(
        __dirname,
        `../../../public/deity/${fileName}`,
      );
      await fs.promises.writeFile(imagePath, buffer);
      data.imageUrl = [`deity/${fileName}`];
      const deity = await prisma.deity.create({ data });
      console.log(deity);
    }
    console.log('Dieties created successfully');
  } catch (error) {
    console.log(error);
  }
}
deities();
