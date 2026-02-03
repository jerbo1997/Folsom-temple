import * as permission from '../../auth/permissions.const';
import { Prisma, PrismaClient } from '@prisma/client';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from '../../const';

const UserPermission = [
  permission.MY_USER,
  permission.UPDATE_USER,
  permission.GET_ALL_TEMPLES,
  permission.GET_ALL_TIMINGS,
  permission.GET_ALL_GROUPS,
  permission.GET_ALL_SERVICETYPES,
  permission.GET_SERVICETYPE,
  permission.GET_ALL_SERVICECALENDARS,
  permission.CREATE_ADDRESS,
  permission.FETCH_ALL_ADDRESS,
  permission.FETCH_ADDRESS,
  permission.UPDATE_ADDRESS,
  permission.DELETE_ADDRESS,
  permission.GET_SERVICE,
  permission.GET_TEMPLE,
  permission.CREATE_FAMILY_MEMBER,
  permission.UPDATE_FAMILY_MEMBER,
  permission.GET_ALL_FAMILY_MEMBER,
  permission.DELETE_FAMILY_MEMBER,
  permission.MY_CART,
  permission.UPDATE_CART,
  permission.RESET_CART,
  permission.CREATE_ORDER,
  permission.GET_ALL_ORDERS,
  permission.GET_ORDERS_COUNT,
  permission.GET_ORDER_BY_ID,
  permission.CREATE_DONATION,
  permission.UPDATE_FCM_TOKEN,
  permission.MY_NOTIFICATION,
  permission.NOTIFICATION,
  permission.UPDATE_NOTIFICATION,
  permission.GET_ALL_NEWS_LETTER,
  permission.GET_NEWS_LETTER,
  permission.GET_ALL_DEITY,
  permission.GET_DEITY,
  permission.DELETE_USER,
  permission.GET_ALL_USER_EVENTS,
  permission.GET_ALL_PROPERTIES,
  permission.GET_PROPERTY,
];

const AdminPermission = [
  permission.MY_USER,
  permission.USER_BY_PHONENUMBER,
  permission.UPDATE_USER,
  permission.GET_ALL_TEMPLES,
  permission.GET_ALL_TIMINGS,
  permission.GET_ALL_GROUPS,
  permission.GET_ALL_SERVICETYPES,
  permission.GET_SERVICETYPE,
  permission.GET_ALL_SERVICECALENDARS,
  permission.CREATE_ADDRESS,
  permission.FETCH_ALL_ADDRESS,
  permission.FETCH_ADDRESS,
  permission.UPDATE_ADDRESS,
  permission.DELETE_ADDRESS,
  permission.GET_SERVICE,
  permission.GET_TEMPLE,
  permission.MY_CART,
  permission.UPDATE_CART,
  permission.RESET_CART,
  permission.CREATE_ORDER,
  permission.GET_ALL_ORDERS,
  permission.GET_ALL_ADMIN_EVENTS,
  permission.GET_ORDERS_COUNT,
  permission.GET_ALL_ORDERS_COUNT,
  permission.GET_ORDER_BY_ID,
  permission.CREATE_DONATION,
  permission.UPDATE_FCM_TOKEN,
  permission.CREATE_NOTIFICATION,
  permission.MY_NOTIFICATION,
  permission.NOTIFICATION,
  permission.UPDATE_NOTIFICATION,
  permission.CREATE_AMAVASYA,
  permission.CREATE_NEWS_LETTER,
  permission.GET_ALL_NEWS_LETTER,
  permission.GET_NEWS_LETTER,
  permission.UPDATE_NEWS_LETTER,
  permission.DELETE_NEWS_LETTER,
  permission.CREATE_DEITY,
  permission.GET_ALL_DEITY,
  permission.GET_DEITY,
  permission.UPDATE_DEITY,
  permission.DELETE_DEITY,
  permission.CREATE_SERVICE,
  permission.DELETE_SERVICE,
  permission.UPDATE_SERVICE,
  permission.CREATE_FAMILY_MEMBER,
  permission.UPDATE_FAMILY_MEMBER,
  permission.GET_ALL_FAMILY_MEMBER,
  permission.DELETE_FAMILY_MEMBER,
  permission.GET_OCCURENCE,
  permission.UPDATE_SERVICE_CALENDAR,
  permission.ADD_ASSET,
  permission.GET_ALL_ASSET,
  permission.GET_ASSET,
  permission.UPDATE_ASSET,
  permission.DELETE_ASSET,
  permission.UPDATE_ASSET_ATTACHMENTS,
  permission.REMOVE_ATTACHMENT,
  permission.CREATE_PREMIUM_BOOKING,
  permission.GET_ALL_PREMIUM_BOOKING,
  permission.GET_PREMIUM_BOOKING,
  permission.CREATE_PROPERTY,
  permission.GET_ALL_PROPERTIES,
  permission.GET_PROPERTY,
  permission.UPDATE_PROPERTY,
];

const GuestPermission = [
  permission.GET_ALL_TEMPLES,
  permission.GET_ALL_TIMINGS,
  permission.GET_ALL_GROUPS,
  permission.GET_ALL_SERVICETYPES,
  permission.GET_SERVICETYPE,
  permission.GET_ALL_SERVICECALENDARS,
  permission.GET_SERVICE,
  permission.GET_TEMPLE,
  permission.MY_NOTIFICATION,
  permission.NOTIFICATION,
  permission.UPDATE_NOTIFICATION,
  permission.GET_ALL_DEITY,
  permission.GET_DEITY,
  permission.GET_ALL_NEWS_LETTER,
  permission.GET_NEWS_LETTER,
  permission.UPDATE_FCM_TOKEN,
];

const rolesData = [
  {
    name: ROLE_USER,
    permissions: UserPermission.map((it) => {
      return { identifier: it };
    }),
  },
  {
    name: ROLE_ADMIN,
    permissions: AdminPermission.map((it) => {
      return { identifier: it };
    }),
  },
  {
    name: ROLE_GUEST,
    permissions: GuestPermission.map((it) => {
      return { identifier: it };
    }),
  },
];

export async function roles() {
  const prisma = new PrismaClient();
  const dbTransactions = [];
  for (const data of rolesData) {
    dbTransactions.push(
      prisma.roles.upsert({
        where: { name: data.name },
        create: {
          name: data.name,
          permissions: { connect: data.permissions },
        },
        update: {
          name: data.name,
          permissions: { connect: data.permissions },
        },
      }),
    );
  }
  const roles = await prisma.$transaction(dbTransactions);
  console.log('\nRoles ', roles.length, ' created');
}
roles();
