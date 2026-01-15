// src/user/user.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: { id: string; email: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: { stripeCustomerId?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findByStripeCustomerId(stripeCustomerId: string) {
    return this.prisma.user.findUnique({
      where: { stripeCustomerId },
    });
  }
}
