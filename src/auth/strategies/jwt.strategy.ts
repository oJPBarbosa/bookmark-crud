import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: {
    id: string;
    email: string;
    createdAt: Date;
  }): Promise<{ id: string }> {
    const { id }: { id: string } = payload;

    const user: User = await this.prismaService.client.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return;
    }

    return {
      id,
    };
  }
}
