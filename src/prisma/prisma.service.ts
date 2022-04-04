import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  public readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }
}
