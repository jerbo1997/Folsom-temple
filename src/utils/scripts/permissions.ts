import * as permissionConst from '../../auth/permissions.const';
import { Prisma, PrismaClient } from '@prisma/client';

export async function permissions() {
  console.log(`Permissions found : `, Object.keys(permissionConst).length);
  const prisma = new PrismaClient();
  const dbTransactions = [];
  const keys = Object.keys(permissionConst);
  for (const it of keys) {
    const identifier = { identifier: permissionConst[it] };
    dbTransactions.push(
      prisma.permissions.upsert({
        where: identifier,
        create: identifier,
        update: identifier,
      }),
    );
  }

  const permissions = await prisma.$transaction(dbTransactions);
  console.log(`Permissions loaded successfully : `, permissions.length);
}
permissions();
