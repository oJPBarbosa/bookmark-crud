import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRequestDTO } from './dtos';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signin(data: AuthRequestDTO): Promise<{ token: string }> {
    const { email, password } = data;

    const user: User = await this.prismaService.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const { id, password: hashed }: { id: string; password: string } = user;

    const matches: boolean = await verify(hashed, password);

    if (!matches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const token: string = await this.jwtService.signAsync(
      { id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '3d',
      },
    );

    return { token };
  }

  async register(
    data: AuthRequestDTO,
  ): Promise<{ id: string; createdAt: Date }> {
    const { email, password } = data;

    if (await this.prismaService.client.user.findUnique({ where: { email } })) {
      throw new ForbiddenException('Credentials taken');
    }

    const id: string = uuid();
    const hashed: string = await hash(password);

    const { createdAt }: { createdAt: Date } =
      await this.prismaService.client.user.create({
        data: {
          id,
          email,
          password: hashed,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

    return { id, createdAt };
  }
}
