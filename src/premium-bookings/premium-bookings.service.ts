import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePremiumBookingDto } from './dto/create-premium-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, TamilMonth } from '@prisma/client';

@Injectable()
export class PremiumBookingsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(input: CreatePremiumBookingDto) {
    const service = await this.prisma.service.findFirst({
      where: { title: 'Nithya Puja' },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    const user = await this.prisma.user.findFirst({
      where: { mobile: input.mobile },
    });
    const data: Prisma.PremiumBookingsCreateInput = {
      registrationNo: input.registrationNo,
      title: input.title,
      devoteeName: input.devoteeName,
      address: {
        create: {
          name: input.devoteeName,
          mobile: input.mobile,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          pinCode: input.pinCode,
          city: input.city,
          state: input.state,
          country: input.country,
        },
      },
      user: user
        ? { connect: { id: user.id } }
        : {
            create: {
              name: input.devoteeName,
              mobile: input.mobile,
              star: input.star,
              rasi: input.rasi,
              gothram: input.gothram,
              email: input.email,
              countryCode: input.countryCode,
            },
          },
      temple: { connect: { templeId: 'Temple-1' } },
      service: { connect: { id: service.id } },
      deityName: input.choiceOfDeity,
      date: input.tamilMonth ? null : input.day,
      englishMonth: input.tamilMonth ? null : input.englishMonth,
      tamilMonth: input.tamilMonth,
      bookingDate: input.bookingDate,
      rptNo: input.rptNo,
      amount: input.amount,
      occasion: input.occasion,
    };
    const puja = await this.prisma.premiumBookings.create({
      data,
      include: { user: { include: { address: true } }, address: true },
    });
    return puja;
  }

  async findAll(month: number, year: number) {
    const tamilMonthsAndStars = {};
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const dateMap = await this.prisma.dateMap.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
    for (const date of dateMap) {
      if (tamilMonthsAndStars[date.tamilMonth]) {
        tamilMonthsAndStars[date.tamilMonth].push(date.star);
      } else {
        tamilMonthsAndStars[date.tamilMonth] = [date.star];
      }
    }
    const updatedArr = Object.entries(tamilMonthsAndStars);
    const whereCondition: Prisma.PremiumBookingsWhereInput = {
      OR: [
        {
          englishMonth: Number(month),
        },
        {
          OR: updatedArr.map(([tamilMonth, stars]) => ({
            AND: [
              {
                tamilMonth: {
                  in: [tamilMonth as TamilMonth],
                },
              },
              {
                user: {
                  star: {
                    in: stars as unknown as string[],
                  },
                },
              },
            ],
          })),
        },
      ],
    };
    const data = await this.prisma.premiumBookings.findMany({
      where: whereCondition,
      include: { user: { include: { address: true } }, address: true },
    });
    return data;
  }

  async findOne(id: string) {
    const booking = await this.prisma.premiumBookings.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Premium Bookings not found');
    }
    return booking;
  }

  /*   update(id: number, updatePremiumBookingDto: UpdatePremiumBookingDto) {
    return `This action updates a #${id} premiumBooking`;
  }

  remove(id: number) {
    return `This action removes a #${id} premiumBooking`;
  } */
}
