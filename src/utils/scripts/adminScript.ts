import { PrismaClient } from '@prisma/client';
import { ROLE_ADMIN } from '../../const';
import { getRole } from '../helperFunction';

export async function adminScript() {
  const prisma = new PrismaClient();
  const users = [
    {
      name: 'Admin',
      mobile: '9988776655',
      countryCode: '+91',
      email: 'admin@gmail.com',
      signUpMethod: 'phone',
      role: { connect: { id: await getRole(prisma, ROLE_ADMIN) } },
      temple: 'Temple-1',
    },
  ];
  const addressData = {
    name: 'Admin',
    mobile: '9312247576',
    addressLine1: 'HAF Pocket 2',
    addressLine2: 'Sri Ram Mandir Marg,sector 7',
    pinCode: '110075',
    city: 'Dwarka',
    state: 'New Delhi',
    country: 'India',
    type: 'Home',
  };
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
        address: { create: addressData },
        familyMember: {
          create: {
            name: user.name,
            rasi: 'Dhanusu',
            star: 'Punarvasu',
            isPrimary: true,
          },
        },
      },
    });
  }
}
adminScript();
