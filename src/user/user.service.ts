import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFcm, UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { getRole } from 'src/utils/helperFunction';
import {
  ROLE_GUEST,
  ROLE_USER,
  SIGNUP_METHOD_PHONE,
  TEMPLE_ID,
} from 'src/const';
import {
  MyUser,
  RoleBasedToken,
  TokenUser,
  UpdateUser,
  User,
} from './user.model';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        star: createUserDto.star,
        rasi: createUserDto.rasi,
        gothram: createUserDto.gothram,
        email: createUserDto.email,
        mobile: createUserDto.mobile,
        gender: createUserDto.gender,
        dob: createUserDto.dob,
        imageUrl: createUserDto.imageUrl,
        countryCode: createUserDto.countryCode,
      },
    });

    return data;
  }

  async myUser(user: User) {
    const myUser: any = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        address: { where: { isActive: true } },
        cart: { include: { cartItems: true }, where: { checkout: false } },
      },
    });
    let userData: MyUser = {
      user: myUser,
      cartItemsCount: myUser?.cart[0]?.cartItems?.length || 0,
    };
    return userData;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async userByPhoneNumber(mobile: string) {
    const user: any = await this.prisma.user.findUnique({
      where: { mobile },
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const userData: MyUser = user;
    return userData;
  }

  async update(user: User, updateUserDto: UpdateUserDto) {
    const familyMember = await this.prisma.familyMember.findFirst({
      where: { userId: user.id, isPrimary: true },
    });
    const data: Prisma.UserUpdateInput = {
      name: updateUserDto.name,
      star: updateUserDto.star,
      rasi: updateUserDto.rasi,
      gothram: updateUserDto.gothram,
      email: updateUserDto.email,
      gender: updateUserDto.gender,
      dob: updateUserDto.dob,
      imageUrl: updateUserDto.imageUrl,
      familyMember: {
        upsert: {
          create: {
            name: updateUserDto.name,
            star: updateUserDto.star ? updateUserDto.star : '',
            rasi: updateUserDto.rasi ? updateUserDto.rasi : '',
            isPrimary: true,
          },
          update: {
            name: updateUserDto.name,
            star: updateUserDto.star,
            rasi: updateUserDto.rasi,
            isPrimary: true,
          },
          where: { id: familyMember ? familyMember.id : '' },
        },
      },
    };

    if (updateUserDto.address) {
      let existingAddress;
      if (updateUserDto.address.id) {
        existingAddress = await this.prisma.address.findUnique({
          where: {
            id: updateUserDto.address.id,
            userId: user.id,
          },
        });
        if (!existingAddress) {
          throw new NotFoundException('Address not found');
        }
      }
      data.address = {
        upsert: {
          where: { id: existingAddress ? existingAddress.id : '' },
          create: {
            addressLine1: updateUserDto.address.addressLine1,
            addressLine2: updateUserDto.address.addressLine2,
            city: updateUserDto.address.city,
            country: updateUserDto.address.country,
            landmark: updateUserDto.address.landmark,
            mobile: updateUserDto.address.mobile,
            name: updateUserDto.address.name,
            state: updateUserDto.address.state,
            type: updateUserDto.address.type,
            pinCode: updateUserDto.address.pinCode,
            tag: updateUserDto.address.tag,
          },
          update: {
            addressLine1: updateUserDto.address.addressLine1,
            addressLine2: updateUserDto.address.addressLine2,
            city: updateUserDto.address.city,
            country: updateUserDto.address.country,
            landmark: updateUserDto.address.landmark,
            mobile: updateUserDto.address.mobile,
            name: updateUserDto.address.name,
            state: updateUserDto.address.state,
            type: updateUserDto.address.type,
            pinCode: updateUserDto.address.pinCode,
            tag: updateUserDto.address.tag,
          },
        },
      };
    }
    const updatedUser: any = await this.prisma.user.update({
      where: { id: user.id },
      include: { address: { where: { isActive: true } } },
      data,
    });
    const userData: UpdateUser = updatedUser;
    userData.provider = updatedUser.signUpMethod;
    return updatedUser;
  }

  async updateFCM(input: UpdateFcm, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id, isActive: true },
    });
    if (!user) {
      throw new BadRequestException(`User not found to update`);
    }
    const guestUser = await this.prisma.user.findFirst({
      where: { role: { name: ROLE_GUEST }, isActive: true },
    });
    const data: Prisma.UserUpdateInput = {};
    if (input.androidFcmToken) {
      const checkAndroid = user.androidFcmToken.includes(input.androidFcmToken);
      if (!checkAndroid || user.androidFcmToken === null) {
        if (
          guestUser &&
          guestUser.androidFcmToken.includes(input.androidFcmToken)
        ) {
          await this.prisma.user.update({
            where: { id: guestUser.id },
            data: {
              androidFcmToken: {
                set: guestUser.androidFcmToken.filter(
                  (token) => token !== input.androidFcmToken,
                ),
              },
            },
          });
        }
        user.androidFcmToken.push(input.androidFcmToken);
        data.androidFcmToken = { set: user.androidFcmToken };
      } else if (checkAndroid) {
        return user;
      }
    }
    if (input.iosFcmToken) {
      const checkIos = user.iosFcmToken.includes(input.iosFcmToken);
      if (!checkIos || user.iosFcmToken === null) {
        if (guestUser && guestUser.iosFcmToken.includes(input.iosFcmToken)) {
          await this.prisma.user.update({
            where: { id: guestUser.id },
            data: {
              iosFcmToken: {
                set: guestUser.iosFcmToken.filter(
                  (token) => token !== input.iosFcmToken,
                ),
              },
            },
          });
        }
        user.iosFcmToken.push(input.iosFcmToken);
        data.iosFcmToken = { set: user.iosFcmToken };
      } else if (checkIos) {
        return user;
      }
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return updatedUser;
  }

  /*   async remove(id: string) {
    await this.findOne(id);
    const data = await this.prisma.user.update({
      where: { id},
      data: { isActive: false },
    });
    return {
      message: 'user removed successfully',
      result: data,
    };
  } */

  async findOrCreateUser(data, countryCode: string) {
    let userWhereArgs: Prisma.UserWhereInput;
    const userCreateData: Prisma.UserCreateInput = {
      isActive: true,
      role: { connect: { id: await getRole(this.prisma, ROLE_USER) } },
    };

    if (data.firebase.sign_in_provider === 'google.com') {
      userWhereArgs = { email: data.email };
      userCreateData.email = data.email;
      userCreateData.signUpMethod = 'google';
    } else if (data.firebase.sign_in_provider === 'phone') {
      const mobile = data.phone_number.slice(countryCode.length);
      userWhereArgs = { countryCode, mobile };
      userCreateData.countryCode = countryCode;
      userCreateData.mobile = mobile;
      userCreateData.signUpMethod = 'phone';
      userCreateData.templeIds = { connect: { templeId: 'Temple-1' } };
    }
    const user = await this.prisma.user.findFirst({ where: userWhereArgs });
    if (user) {
      return user;
    }
    return await this.prisma.user.create({ data: userCreateData });
  }

  async findOrCreateUserByMobile(data) {
    const existingUser = await this.prisma.user.findFirst({
      where: { mobile: data.mobile },
    });
    if (existingUser) {
      return existingUser;
    }
    return await this.prisma.user.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        countryCode: data.countryCode,
        star: data.star,
        rasi: data.rasi,
        gothram: data.gothram,
        signUpMethod: SIGNUP_METHOD_PHONE,
        templeIds: { connect: { templeId: TEMPLE_ID } },
        familyMember: {
          create: {
            star: data.star,
            rasi: data.rasi,
            name: data.name,
            isPrimary: true,
          },
        },
      },
    });
  }

  async getUserTokens(roles: RoleBasedToken[]) {
    const transactions = [];
    roles.forEach((it) => {
      const wherecondition: Prisma.UserWhereInput = {};
      wherecondition.AND = [{ isActive: true }];
      const selectCondition: Prisma.UserSelect = {
        id: true,
        role: { select: { name: true } },
        androidFcmToken: true,
        iosFcmToken: true,
      };
      wherecondition.AND.push(
        ...[
          {
            OR: [
              { androidFcmToken: { isEmpty: false } },
              { iosFcmToken: { isEmpty: false } },
            ],
          },
          {
            role: { name: it.role },
          },
        ],
      );
      selectCondition.role['where'] = {
        name: it.role,
      };
      //logic to exclude userIds as it is not required
      if (it.excludeUserIds && it.excludeUserIds.length) {
        wherecondition.AND.push({ id: { notIn: it.excludeUserIds } });
      }
      //logic to include only userIds
      if (it.includeUserIds && it.includeUserIds.length) {
        wherecondition.AND.push({ id: { in: it.includeUserIds } });
      }
      //Mapping data as type (TokenUser[])
      transactions.push(
        this.prisma.user.findMany({
          where: wherecondition,
          select: selectCondition,
        }),
      );
    });
    const data = await this.prisma.$transaction(transactions);
    const result: [TokenUser] = data.flatMap((item) => {
      return item.map((it) => {
        const obj = { userId: it.id };
        obj['tokens'] = it.androidFcmToken.concat(it.iosFcmToken) || null;
        obj['role'] = it.role.name;
        return obj;
      });
    }) as any;
    return result;
  }

  async remove(user) {
    return await this.prisma.user.delete({ where: { id: user.id } });
  }
}
