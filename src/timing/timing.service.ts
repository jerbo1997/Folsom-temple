import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';

@Injectable()
export class TimingService {
  constructor(private readonly prisma: PrismaService) { }
  /*create(createTimingDto: CreateTimingDto) {
    return 'This action adds a new timing';
  }*/

  async findAll(templeId: string, user: UserAndRole) {
    const temple = await this.prisma.temple.findFirst(
      {
        where: {
          templeId: templeId,
          isActive: true,
          users: { some: { id: user.id } }
        },
        include: { timings: { where: { isActive: true } } }
      })
    if (!temple) {
      throw new NotFoundException('Temple not found')
    }
    const finalTimings = []
    temple.timings.forEach(it => {
      const season = { "title": it.title, "timings": [] };
      (it.timing as any[]).forEach(time => {
        season.timings.push({ "title": time.type, "timing": `${time.morning.startTime} to ${time.morning.endTime}`, "type": "Morning" }, { "title": time.type, "timing": `${time.evening.startTime} to ${time.evening.endTime}`, "type": "Evening" })
      })
      finalTimings.push(season)
    })
    let timing: any = temple.timingMeta
    timing.timings = []
    timing.timings.push(...finalTimings)
    return timing
  }

  async findOne(id: string) {
    const timing = await this.prisma.timing.findUnique({
      where: { id, isActive: true }
    });
    if (!timing) {
      throw new NotFoundException(`timing not found`);
    }
    return timing;
  }

  /*update(id: number, updateTimingDto: UpdateTimingDto) {
    return `This action updates a #${id} timing`;
  }

  remove(id: number) {
    return `This action removes a #${id} timing`;
  }*/
}
