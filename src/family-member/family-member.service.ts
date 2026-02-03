import { Injectable } from '@nestjs/common';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserAndRole } from 'src/user/user.model';
import { CART } from 'src/const';

@Injectable()
export class FamilyMemberService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    createFamilyMemberDto: CreateFamilyMemberDto,
    user: UserAndRole,
  ) {
    const data: Prisma.FamilyMemberCreateInput = {
      name: createFamilyMemberDto.name,
      star: createFamilyMemberDto.star,
      rasi: createFamilyMemberDto.rasi,
      user: { connect: { id: user.id } },
    };
    return await this.prisma.familyMember.create({
      data,
      include: { user: true },
    });
  }

  async findAll(operation: string, user: UserAndRole) {
    const args: Prisma.FamilyMemberFindManyArgs = {};
    const where: Prisma.FamilyMemberWhereInput = { userId: user.id };
    if (operation !== CART) {
      where.isPrimary = false;
    }
    args.orderBy = { createdAt: 'desc' };
    args.where = where;
    return await this.prisma.familyMember.findMany(args);
  }

  async update(
    id: string,
    updateFamilyMemberDto: UpdateFamilyMemberDto,
    user: UserAndRole,
  ) {
    const data: Prisma.FamilyMemberUpdateInput = {
      name: updateFamilyMemberDto.name,
      star: updateFamilyMemberDto.star,
      rasi: updateFamilyMemberDto.rasi,
      user: { connect: { id: user.id } },
    };
    return await this.prisma.familyMember.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async remove(id: string) {
    return await this.prisma.familyMember.delete({
      where: { id },
      include: { user: true },
    });
  }
}
