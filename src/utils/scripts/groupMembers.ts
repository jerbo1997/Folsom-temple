import { PrismaClient } from '@prisma/client';
import { Options, parse } from 'csv-parse';
import { readFile } from 'fs/promises';
import { promisify } from 'util';

const parsePromise = promisify<Buffer, Options, any>(parse);

export async function groupMembers() {
  const prisma = new PrismaClient();
  const eventDetails = await readFile('src/utils/scripts/dm/TempleGroups.csv');
  const groupInfo = await parsePromise(eventDetails, { columns: true });
  const memberData = {};
  for (const input of groupInfo) {
    const groupName = input['groupName'];
    const groupSort = input['groupSort'];

    let group = await prisma.group.findFirst({ where: { name: groupName } });
    if (!group) {
      group = await prisma.group.create({
        data: {
          name: groupName,
          groupSort: Number(groupSort),
          temple: { connect: { templeId: 'Temple-1' } },
        },
      });
    }
    if (
      !Object.keys(memberData).includes(
        `${group.name}-${input['name']}-${input['contact']}-${input['sortOrder']}`,
      )
    ) {
      memberData[
        `${group.name}-${input['name']}-${input['contact']}-${input['sortOrder']}`
      ] = {
        name: input['name'],
        contactNo: [input['contact']],
        sortOrder: parseInt(input['sortOrder']),
        groupId: group.id,
      };
    }
  }
  const memberDataArray: any = Object.values(memberData);
  await prisma.member.createMany({ data: memberDataArray });
  await prisma.$disconnect();
}

groupMembers();
