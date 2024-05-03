import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(body: CreateAuthDto) {
    try {
      //hash password
      const password = await bcrypt.hash(
        body.password,
        +process.env.BCRYPT_PASSWORD,
      );
      //create user
      const user = await this.prisma.user.create({
        data: {
          ...body,
          password: password,
        },
      });
      //generate token
      const payload = { sub: user.id, phoneNumber: user.phoneNumber };
      const access_token = await this.jwtService.signAsync(payload);
      return {
        access_token: access_token,
        userId: user.id,
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.CONFLICT);
    }
  }

  async login(phoneNumber: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: phoneNumber },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }
    //generate token
    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token: access_token,
      userId: user.id,
    };
  }

  async getProfile(user_id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        birthday: true,
        gender: true,
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async update(body: UpdateAuthDto, user_id: number) {
    try {
      // update except password
      await this.prisma.user.update({
        where: { id: user_id },
        data: {
          fullName: body.fullName,
          phoneNumber: body.phoneNumber,
          email: body.email,
          gender: body.gender,
          city: body.city,
          birthday: body.birthday,
        },
      });
      return 'updated';
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendPhoneCode(phoneNumber: string) {
    const code = await this.getRandomSixDigitNumber();
    const message = `Your code is ${code}`;
    await this.prisma.phoneCode.upsert({
      where: { phoneNumber: phoneNumber },
      update: { code: code },
      create: { phoneNumber: phoneNumber, code: code },
    });
    await this.sendSms(phoneNumber, message);
    return 'sended';
  }

  async verifyPhoneCode(phoneNumber: string, code: string) {
    const phoneCode = await this.prisma.phoneCode.findUnique({
      where: { phoneNumber: phoneNumber, code: code },
    });
    if (!phoneCode) {
      throw new HttpException('Code not found', HttpStatus.NOT_FOUND);
    }
    if (phoneCode.code !== code) {
      throw new HttpException('Wrong code', HttpStatus.UNAUTHORIZED);
    }
    return 'verified';
  }

  async changePassword(phoneNumber: string, newPassword: string, code: string) {
    const phoneCode = await this.prisma.phoneCode.findUnique({
      where: { phoneNumber: phoneNumber },
    });
    if (!phoneCode) {
      throw new HttpException('Phone number not found', HttpStatus.NOT_FOUND);
    }
    if (phoneCode.code !== code) {
      throw new HttpException('Wrong code', HttpStatus.UNAUTHORIZED);
    }
    const password = await bcrypt.hash(
      newPassword,
      +process.env.BCRYPT_PASSWORD,
    );
    await this.prisma.user.update({
      where: { phoneNumber: phoneNumber },
      data: { password: password },
    });
    return 'changed';
  }

  async sendSms(phoneNumber: string, message: string) {
    let TOKEN = await this.cacheManager.get('smsToken');
    if (!TOKEN) {
      TOKEN = await this.getToken();
    }
    const response = await fetch(process.env.SMS_URL + 'message/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        mobile_phone: phoneNumber,
        message: message,
        from: process.env.SMS_FROM,
      }),
    });
    if (response.status !== 200) {
      TOKEN = await this.getToken();
      const response = await fetch(process.env.SMS_URL + 'message/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          mobile_phone: phoneNumber,
          message: message,
          from: process.env.SMS_FROM,
        }),
      });
      if (response.status !== 200) {
        throw new HttpException('SMS not sent', HttpStatus.BAD_REQUEST);
      }
    }
    return true;
  }

  async getToken() {
    const newToken = await fetch(process.env.SMS_URL + 'auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.SMS_EMAIL,
        password: process.env.SMS_PASSWORD,
      }),
    })
      .then((res) => res.json())
      .catch((error) => {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      });
    if (newToken.data.token) {
      await this.cacheManager.set('smsToken', newToken.data.token);
      return newToken.data.token;
    } else {
      throw new HttpException('Token not found', HttpStatus.BAD_REQUEST);
    }
  }

  async getRandomSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
