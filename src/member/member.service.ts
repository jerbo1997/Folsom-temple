import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ROLE_ADMIN } from 'src/const';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) { }
  /*create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }*/

  async findAll(user: UserAndRole) {
    const whereCondition: Prisma.MemberWhereInput = { isActive: true };
    if (user.role === ROLE_ADMIN) {
      whereCondition
    };
    return await this.prisma.member.findMany({
      where: whereCondition
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id, isActive: true }
    });
    if (!member) {
      throw new NotFoundException(`member not found`);
    }
    return member;
  }

  /*update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }*/
}
