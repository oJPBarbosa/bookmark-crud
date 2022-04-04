import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'argon2';
import { User } from '@prisma/client';
import { UpdateUserRequestDTO } from './dtos';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async update(
    id: string,
    data: UpdateUserRequestDTO,
  ): Promise<{ id: string; email: string; updatedAt: Date }> {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const { email, password }: { email?: string; password?: string } = data;

    if (
      await this.prismaService.client.user.findUnique({
        where: { email },
      })
    ) {
      throw new ForbiddenException('Credentials taken');
    }

    const hashed: string = password ? await hash(password) : user.password;

    const { updatedAt }: { updatedAt: Date } =
      await this.prismaService.client.user.update({
        where: { id },
        data: { email, password: hashed },
      });

    return {
      id,
      email,
      updatedAt,
    };
  }
}
