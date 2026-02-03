import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { UpdateOrder } from 'src/order/dto/create-order.dto';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { TokenUser } from 'src/user/user.model';
import { NotificationService } from 'src/notification/notification.service';
import {
  CUSTOM_DATES_PICKER,
  DAILY,
  DATES_RANGE,
  EVENT,
  EVERY_FRIDAY,
  EVERY_MONDAY,
  EVERY_SATURDAY,
  EVERY_SUNDAY,
  EVERY_THURSDAY,
  EVERY_TUESDAY,
  EVERY_WEDNESDAY,
  FOLDER_PUBLIC,
  MONTHLY_1ST_FRIDAY,
  MONTHLY_1ST_MONDAY,
  MONTHLY_1ST_SATURDAY,
  MONTHLY_1ST_SUNDAY,
  MONTHLY_1ST_THURSDAY,
  MONTHLY_1ST_TUESDAY,
  MONTHLY_1ST_WEDNESDAY,
  MONTHLY_2ND_FRIDAY,
  MONTHLY_2ND_MONDAY,
  MONTHLY_2ND_SATURDAY,
  MONTHLY_2ND_SUNDAY,
  MONTHLY_2ND_THURSDAY,
  MONTHLY_2ND_TUESDAY,
  MONTHLY_2ND_WEDNESDAY,
  MONTHLY_3RD_FRIDAY,
  MONTHLY_3RD_MONDAY,
  MONTHLY_3RD_SATURDAY,
  MONTHLY_3RD_SUNDAY,
  MONTHLY_3RD_THURSDAY,
  MONTHLY_3RD_TUESDAY,
  MONTHLY_3RD_WEDNESDAY,
  MONTHLY_4TH_FRIDAY,
  MONTHLY_4TH_MONDAY,
  MONTHLY_4TH_SATURDAY,
  MONTHLY_4TH_SUNDAY,
  MONTHLY_4TH_THURSDAY,
  MONTHLY_4TH_TUESDAY,
  MONTHLY_4TH_WEDNESDAY,
  MONTHLY_5TH_FRIDAY,
  MONTHLY_5TH_MONDAY,
  MONTHLY_5TH_SATURDAY,
  MONTHLY_5TH_SUNDAY,
  MONTHLY_5TH_THURSDAY,
  MONTHLY_5TH_TUESDAY,
  MONTHLY_5TH_WEDNESDAY,
  MONTHLY_DATES,
  MONTHLY_DATES_OCCURENCE,
  MONTHLY_DAYS,
  MONTHLY_DAYS_OCCURENCE,
  NEW_EVENT,
  NEW_ORDER,
  ORDER,
  ROLE_ADMIN,
  ROLE_USER,
  WEEKLY,
  WEEKLY_OCCURENCE,
} from '../const';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function getRole(
  prisma: PrismaService | PrismaClient,
  role: string,
) {
  const roleData = await prisma.roles.findFirst({
    where: { name: role },
  });
  if (!roleData) {
    console.log(`Role - ${role} not found`);
    throw new BadRequestException(`Something went wrong`);
  }
  return roleData.id;
}

export async function getRoles(
  prisma: PrismaService | PrismaClient,
  role: string[],
) {
  const roleData = await prisma.roles.findMany({
    where: { name: { in: role } },
    select: { id: true }, // Select only the ID field
  });
  if (!roleData || roleData.length !== role.length) {
    console.log(`<<< roles not found`);
    throw new BadRequestException(`Something went wrong`);
  }
  return roleData.map((role) => role.id);
}

export const commonErrorCodes = {
  //teple not available
  301: {
    alertText: `You are in a different temple would you like to reset cart`,
    alertButton1: 'OK',
    alertButton2: null,
    code: 301,
  },
};

export async function orderNo(prisma: PrismaClient) {
  // Get the current order count with order numbers starting with 'O'
  const currentOrderCount = await prisma.order.count({
    where: { orderNo: { startsWith: 'O' } },
  });

  // Set the orderCounter based on the current order count
  const orderCounter = 1000 + currentOrderCount;

  // Format the current date as "DDMMYYYY"
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = String(currentDate.getFullYear());
  const date = `${day}${month}${year}`;

  return `O-${date}-${orderCounter}`;
}

export function webhook(req) {
  const data: UpdateOrder = {
    id: req.payload.payment.entity.order_id,
    amount: req.payload.payment.entity.amount / 100,
    event: req.event,
    paymentId: req.payload.payment.entity.id,
    paymentMethod: req.payload.payment.entity.method,
  };
  return data;
}

/*export async function calendars(prisma: PrismaService, dates, serviceIds) {
  //consider this as obj = {isoDate:true}
  let days = {};
  //retrieve calendars post dates[0]
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    include: { serviceCalendar: true },
  });
  for (const service of services) {
    if (!service.occurence) {
      continue;
    }
    const occurence = (service.occurence as Prisma.JsonArray).map((it) => it);
    for (const data of occurence) {
      //just push date
      if (data === DAILY) {
        dates.filter((date) => {
          days[date.toISOString()] = { date: date.toISOString() };
        });
      } else if (data === EVERY_MONDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 1) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_TUESDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 2) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_WEDNESDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 3) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_THURSDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 4) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_FRIDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 5) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_SATURDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 6) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === EVERY_SUNDAY) {
        dates.filter((date) => {
          const dayIndex = date.getDay();
          if (dayIndex === 0) {
            days[date.toISOString()] = { date: date.toISOString() };
          }
        });
      } else if (data === MONTHLY_1ST_SUNDAY) {
        for (const day of dates) {
          if (day.getDay() === 0 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (String(data).includes('MONTHLY_DATES_')) {
        for (const day of dates) {
          if (
            day.getDate().toString() === String(data).split('_').slice(-1)[0]
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_SUNDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 0 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_SUNDAY) {
        for (const day of dates) {
          if (day.getDay() === 0 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_SUNDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 0 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_SUNDAY) {
        for (const day of dates) {
          if (day.getDay() === 0 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_SATURDAY) {
        for (const day of dates) {
          if (day.getDay() === 6 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_SATURDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 6 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_SATURDAY) {
        for (const day of dates) {
          if (day.getDay() === 6 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_SATURDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 6 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_SATURDAY) {
        for (const day of dates) {
          if (day.getDay() === 6 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_FRIDAY) {
        for (const day of dates) {
          if (day.getDay() === 5 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_FRIDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 5 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_FRIDAY) {
        for (const day of dates) {
          if (day.getDay() === 5 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_FRIDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 5 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_FRIDAY) {
        for (const day of dates) {
          if (day.getDay() === 5 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_THURSDAY) {
        for (const day of dates) {
          if (day.getDay() === 4 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_THURSDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 4 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_THURSDAY) {
        for (const day of dates) {
          if (day.getDay() === 4 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_THURSDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 4 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_THURSDAY) {
        for (const day of dates) {
          if (day.getDay() === 4 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_WEDNESDAY) {
        for (const day of dates) {
          if (day.getDay() === 3 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_WEDNESDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 3 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_WEDNESDAY) {
        for (const day of dates) {
          if (day.getDay() === 3 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_WEDNESDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 3 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_WEDNESDAY) {
        for (const day of dates) {
          if (day.getDay() === 3 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_TUESDAY) {
        for (const day of dates) {
          if (day.getDay() === 2 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_TUESDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 2 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_TUESDAY) {
        for (const day of dates) {
          if (day.getDay() === 2 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_TUESDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 2 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_TUESDAY) {
        for (const day of dates) {
          if (day.getDay() === 2 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_1ST_MONDAY) {
        for (const day of dates) {
          if (day.getDay() === 1 && day.getDate() <= 7) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_3RD_MONDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 1 &&
            day.getDate() >= 15 &&
            day.getDate() <= 21
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_2ND_MONDAY) {
        for (const day of dates) {
          if (day.getDay() === 1 && day.getDate() >= 7 && day.getDate() <= 13) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_4TH_MONDAY) {
        for (const day of dates) {
          if (
            day.getDay() === 1 &&
            day.getDate() >= 21 &&
            day.getDate() <= 28
          ) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      } else if (data === MONTHLY_5TH_MONDAY) {
        for (const day of dates) {
          if (day.getDay() === 1 && day.getDate() > 28 && day.getDate() <= 31) {
            days[day.toISOString()] = { date: day.toISOString() };
          }
        }
      }
      console.log(Object.values(days).length, 'intial days length >>>>>');
      for (const calendar of service.serviceCalendar) {
        if (days[calendar.date.toISOString()]) {
          delete days[calendar.date.toISOString()];
        }
      }
      console.log(
        Object.values(days).length,
        'after duplicate removed days length >>>>>',
      );
      //Additional check
      //days = [isoDates]
      //service.calendars.forLoop it=>  {if(obj[it]){delete obj[it]}}
      //duplicate
      //non duplicate obj
      //loop to prepare {date:it}
      // console length days//post removal length
      await prisma.service.update({
        where: { id: service.id },
        data: {
          serviceCalendar: {
            createMany: { data: Object.values(days) },
          },
        },
      });
      days = {};
    }
  }
  return;
}*/

export async function calendars(prisma: PrismaService, dates, serviceIds) {
  let days = {};
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    include: { serviceCalendar: true },
  });
  for (const service of services) {
    if (!service.occurence) {
      continue;
    }
    const occurence = (service.occurence as Prisma.JsonArray).map((it) => it);
    for (const data of occurence) {
      dates.forEach((date) => {
        switch (data) {
          case DAILY:
            days[date.toDateString()] = { date: date.toISOString() };
            break;
          case EVERY_MONDAY:
            if (date.getDay() === 1) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_TUESDAY:
            if (date.getDay() === 2) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_WEDNESDAY:
            if (date.getDay() === 3) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_THURSDAY:
            if (date.getDay() === 4) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_FRIDAY:
            if (date.getDay() === 5) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_SATURDAY:
            if (date.getDay() === 6) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case EVERY_SUNDAY:
            if (date.getDay() === 0) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_SUNDAY:
            if (date.getDay() === 0 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case String(data).includes('MONTHLY_DATES_'):
            if (
              date.getDate().toString() === String(data).split('_').slice(-1)[0]
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
          case MONTHLY_3RD_SUNDAY:
            if (
              date.getDay() === 0 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_SUNDAY:
            if (
              date.getDay() === 0 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_SUNDAY:
            if (
              date.getDay() === 0 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_SUNDAY:
            if (
              date.getDay() === 0 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_SATURDAY:
            if (date.getDay() === 6 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_SATURDAY:
            if (
              date.getDay() === 6 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_SATURDAY:
            if (
              date.getDay() === 6 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_SATURDAY:
            if (
              date.getDay() === 6 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_SATURDAY:
            if (
              date.getDay() === 6 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_FRIDAY:
            if (date.getDay() === 5 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_FRIDAY:
            if (
              date.getDay() === 5 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_FRIDAY:
            if (
              date.getDay() === 5 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_FRIDAY:
            if (
              date.getDay() === 5 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_FRIDAY:
            if (
              date.getDay() === 5 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_THURSDAY:
            if (date.getDay() === 4 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_THURSDAY:
            if (
              date.getDay() === 4 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_THURSDAY:
            if (
              date.getDay() === 4 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_THURSDAY:
            if (
              date.getDay() === 4 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_THURSDAY:
            if (
              date.getDay() === 4 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_WEDNESDAY:
            if (date.getDay() === 3 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_WEDNESDAY:
            if (
              date.getDay() === 3 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_WEDNESDAY:
            if (
              date.getDay() === 3 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_WEDNESDAY:
            if (
              date.getDay() === 3 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_WEDNESDAY:
            if (
              date.getDay() === 3 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_TUESDAY:
            if (date.getDay() === 2 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_TUESDAY:
            if (
              date.getDay() === 2 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_TUESDAY:
            if (
              date.getDay() === 2 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_TUESDAY:
            if (
              date.getDay() === 2 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_TUESDAY:
            if (
              date.getDay() === 2 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_1ST_MONDAY:
            if (date.getDay() === 1 && date.getDate() <= 7) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_3RD_MONDAY:
            if (
              date.getDay() === 1 &&
              date.getDate() >= 15 &&
              date.getDate() <= 21
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_2ND_MONDAY:
            if (
              date.getDay() === 1 &&
              date.getDate() >= 7 &&
              date.getDate() <= 13
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_4TH_MONDAY:
            if (
              date.getDay() === 1 &&
              date.getDate() >= 21 &&
              date.getDate() <= 28
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
          case MONTHLY_5TH_MONDAY:
            if (
              date.getDay() === 1 &&
              date.getDate() > 28 &&
              date.getDate() <= 31
            ) {
              days[date.toDateString()] = { date: date.toISOString() };
            }
            break;
        }
      });
    }
    console.log('intial days length >>>>>', Object.values(days).length);
    for (const calendar of service.serviceCalendar) {
      if (days[calendar.date.toDateString()]) {
        delete days[calendar.date.toDateString()];
      }
    }
    console.log(
      'after duplicate removed days length >>>>>',
      Object.values(days).length,
    );
    await prisma.service.update({
      where: { id: service.id },
      data: {
        serviceCalendar: {
          createMany: { data: Object.values(days) },
        },
      },
    });
    days = {};
  }
  return;
}

export async function notification(
  fireBase: FirebaseService,
  users: TokenUser[],
  titleMessage: string,
  bodyMessage: string,
  categoryMessage: string,
  subMessage: string,
  payLoadData: any,
  notificationService?: NotificationService,
  role?: string,
) {
  //notification service create
  const data = {
    title: titleMessage,
    description: bodyMessage,
    targetId: payLoadData.id,
    targetModule: categoryMessage,
    users,
    role,
  };
  await notificationService.create(data);
  const token = users.flatMap((it) => it.tokens);
  fireBase.sendPushNotifications({
    token,
    title: titleMessage,
    body: bodyMessage,
    category: categoryMessage,
    sub_category: subMessage,
    payload: { payLoadData },
  });
}

//FlatRequest Notification
export function notificationMessages(
  module: any,
  action: any,
  message: any,
  role?: any,
) {
  switch (module) {
    case ORDER: {
      switch (action) {
        case NEW_ORDER: {
          switch (role) {
            case ROLE_ADMIN: {
              return {
                title: 'New order',
                body: `New order ${message.title} created by ${message.userName}`,
              };
            }
            case ROLE_USER: {
              return {
                title: 'New order',
                body: `New order ${message.title} created successfully`,
              };
            }
          }
        }
      }
    }
    case EVENT: {
      switch (action) {
        case NEW_EVENT: {
          return {
            title: 'New Event',
            body: `The upcoming tomorrow event is ${message.eventName}`,
          };
        }
      }
    }
  }
}

export function uploadFile(files: any, module: string) {
  let url;
  if (files === typeof String) {
    const file = files.filename;
    url = `${module}/${file}`;
  } else {
    const fileUrls = files.map((file) => file.filename);
    url = fileUrls.map((it) => `${module}/${it}`);
  }
  return url;
}

export function unlinkFile(dirName: string, filename: string) {
  const fullPath = path.join(dirName, '..', '..', FOLDER_PUBLIC, filename);
  try {
    fs.unlink(fullPath);
  } catch (error) {
    console.log('err>>>', error);
  }
}

export function fetchFiles(files: string[]) {
  if (!files || !files.length) {
    return;
  }
  const urls = [];
  files.forEach((it) => {
    urls.push(`${process.env.BASE_URL}/${it}`);
  });
  return urls;
}

export async function waitFunction(milliSeconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Waiting Here ++++++++++++++');
      resolve(true);
    }, milliSeconds);
  });
}

export async function serviceInputValidation(
  occurenceType: string[],
  occurences?: string[],
  dates?: string[],
) {
  if (
    !occurenceType.includes(CUSTOM_DATES_PICKER) &&
    !occurenceType.includes(DATES_RANGE)
  ) {
    if (
      !occurenceType.includes(DAILY) &&
      (!occurences || occurences === null)
    ) {
      throw new BadRequestException('Occurence should not be empty');
    }
    if (dates?.length) {
      throw new BadRequestException('dates should be empty');
    }
    if (occurences) {
      const updatedOccurence = new Set(occurences).size;
      if (
        updatedOccurence !== occurences?.length ||
        !occurences.length ||
        (occurenceType.includes(DAILY) && occurences !== null)
      ) {
        throw new BadRequestException('Invalid occurence input');
      }
      for (const occurence of occurences) {
        if (occurenceType.includes(WEEKLY)) {
          if (!WEEKLY_OCCURENCE[occurence]) {
            throw new BadRequestException('Invalid weekly occurence input');
          }
        } else if (occurenceType.includes(MONTHLY_DAYS)) {
          if (!MONTHLY_DAYS_OCCURENCE[occurence]) {
            throw new BadRequestException(
              'Invalid Monthly days occurence input',
            );
          }
        } else if (occurenceType.includes(MONTHLY_DATES)) {
          if (!MONTHLY_DATES_OCCURENCE[occurence]) {
            throw new BadRequestException(
              'Invalid Monthly dates occurence input',
            );
          }
        }
      }
    }
  } else {
    if (!dates?.length) {
      throw new BadRequestException('dates should not be empty');
    }
    if (occurences?.length) {
      throw new BadRequestException(
        `Occurence should be empty when OccurenceType is ${occurenceType}`,
      );
    }
  }
}

export async function userInputValidation(
  name?: string,
  mobile?: string,
  countryCode?: string,
  star?: string,
  rasi?: string,
  gothram?: string,
) {
  if (
    Boolean(name || mobile || countryCode || star || rasi || gothram) &&
    !Boolean(name && mobile && countryCode && star && rasi && gothram)
  ) {
    throw new BadRequestException('More user details should be required');
  }
}

export function dateInputValidation(startDate?: string, endDate?: string) {
  if (!Boolean(startDate && endDate)) {
    throw new BadRequestException('StartDate and endDate should not be empty');
  }
}

export function addressInputValidation(
  name?: string,
  phoneNumber?: string,
  address?: string,
  city?: string,
  pincode?: string,
) {
  if (!Boolean(name && phoneNumber && address && city && pincode)) {
    throw new BadRequestException(
      'More user address details should be required',
    );
  }
}
