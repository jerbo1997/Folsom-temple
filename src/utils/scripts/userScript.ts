import { PrismaClient } from '@prisma/client';
import { ROLE_GUEST } from '../../const';
import { getRole } from '../helperFunction';

export async function userScript() {
  const prisma = new PrismaClient();
  const users = [
    {
      name: 'Guest',
      mobile: '1110000222',
      countryCode: '+91',
      email: 'guest@gmail.com',
      signUpMethod: 'phone',
      role: { connect: { id: await getRole(prisma, ROLE_GUEST) } },
      temple: 'Temple-1',
    },
  ];
  for (const user of users) {
    await prisma.user.create({
      data: {
        name: user.name,
        mobile: user.mobile,
        countryCode: user.countryCode,
        email: user.email,
        signUpMethod: user.signUpMethod,
        role: user.role,
        templeIds: { connect: { templeId: user.temple } },
      },
    });
  }
}
userScript();
