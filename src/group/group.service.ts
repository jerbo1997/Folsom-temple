import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ROLE_ADMIN } from 'src/const';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}
  /*create(createGroupDto: CreateGroupDto) {
    return 'This action adds a new group';
  }*/

  async findAll(templeId: string, user: UserAndRole) {
    const temple = await this.prisma.temple.findUnique({
      where: {
        templeId: templeId,
        isActive: true,
        users: { some: { id: user.id } },
      },
      include: {
        groups: {
          where: { isActive: true },
          orderBy: { groupSort: 'asc' },
          include: {
            members: {
              orderBy: { sortOrder: 'asc' },
              where: { isActive: true },
            },
          },
        },
      },
    });
    if (!temple) {
      throw new NotFoundException('Group not found');
    }
    return temple.groups;
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id, isActive: true },
      include: { members: true },
    });
    if (!group) {
      throw new NotFoundException(`group not found`);
    }
    return group;
  }

  /*update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }*/
}
