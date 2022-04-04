import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Bookmark } from '@prisma/client';
import { CreateBookmarkRequestDTO, UpdateBookmarkRequestDTO } from './dtos';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  async findAll(userId: string): Promise<
    {
      id: string;
      url: string;
      title: string;
      description: string;
      createdAt: Date;
    }[]
  > {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const bookmarks: {
      id: string;
      url: string;
      title: string;
      description: string;
      createdAt: Date;
    }[] = await this.prismaService.client.bookmark.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    return bookmarks;
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<{
    id: string;
    url: string;
    title: string;
    description: string;
    createdAt: Date;
  }> {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const bookmark: {
      id: string;
      url: string;
      title: string;
      description: string;
      createdAt: Date;
    } = await this.prismaService.client.bookmark.findFirst({
      where: { id, userId },
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        createdAt: true,
      },
    });

    return bookmark;
  }

  async create(
    userId: string,
    data: CreateBookmarkRequestDTO,
  ): Promise<{ id: string; createdAt: Date }> {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const id: string = uuid();
    const { url, title, description }: CreateBookmarkRequestDTO = data;

    const bookmark: { id: string; createdAt: Date } =
      await this.prismaService.client.bookmark.create({
        data: {
          id,
          userId,
          url,
          title,
          description,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

    return bookmark;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateBookmarkRequestDTO,
  ): Promise<{
    id: string;
    url: string;
    title: string;
    description: string;
    updatedAt: Date;
  }> {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const { url, title, description }: UpdateBookmarkRequestDTO = data;

    const bookmark: {
      id: string;
      url: string;
      title: string;
      description: string;
      updatedAt: Date;
    } = await this.prismaService.client.bookmark.update({
      where: { id },
      data: {
        url,
        title,
        description,
      },
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        updatedAt: true,
      },
    });

    if (!bookmark) {
      throw new BadRequestException('Invalid bookmark');
    }

    return bookmark;
  }

  async delete(id: string, userId: string) {
    const user: User = await this.prismaService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const bookmark: Bookmark =
      await this.prismaService.client.bookmark.findFirst({
        where: { id, userId },
      });

    if (!bookmark) {
      throw new BadRequestException('Invalid bookmark');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prismaService.client.bookmark.delete({
      where: { id },
    });
  }
}
