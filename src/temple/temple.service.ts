import { Injectable, NotFoundException } from '@nestjs/common';
import { UserAndRole } from 'src/user/user.model';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TempleService {
  constructor(private readonly prisma: PrismaService) {}
  /*create(createTempleDto: CreateTempleDto) {
    return 'This action adds a new temple';
  }*/

  async findAll(user: UserAndRole) {
    const whereCondition: Prisma.TempleWhereInput = {
      isActive: true,
    };
    const temple = await this.prisma.temple.findMany({
      where: whereCondition,
      include: { timings: true, groups: { include: { members: true } } },
    });
    const templeData = [];
    temple.forEach((it) => {
      const finalTimings = [];
      let temples: any = {};
      (temples.name = it.name),
        (temples.templeId = it.templeId),
        (temples.info = {
          phone: it.phone,
          mobile: it.mobile,
          address: it.address,
        }),
        (temples.state = it.state),
        (temples.country = it.country),
        (temples.postalCode = it.postalCode),
        (temples.history = it.history),
        (temples.about = it.about),
        it.timings.forEach((timing) => {
          const season = { title: timing.title, timings: [] };
          (timing.timing as any[]).forEach((time) => {
            season.timings.push({
              type: time.type,
              morning: `${time.morning.startTime} to ${time.morning.endTime}`,
              evening: `${time.evening.startTime} to ${time.evening.endTime}`,
            });
          });
          finalTimings.push(season);
          let timingMeta: any = it.timingMeta;
          timingMeta.timings = [];
          timingMeta.timings.push(...finalTimings);
        });
      temples.timings = finalTimings;
      temples.groups = it.groups;
      templeData.push(temples);
    });
    return templeData;
  }

  async findOne(id: string) {
    const temple = await this.prisma.temple.findUnique({
      where: { templeId: id, isActive: true },
    });
    if (!temple) {
      throw new NotFoundException(`temple not found`);
    }
    return temple;
  }

  /*update(id: number, updateTempleDto: UpdateTempleDto) {
    return `This action updates a #${id} temple`;
  }

  remove(id: number) {
    return `This action removes a #${id} temple`;
  }*/
}
