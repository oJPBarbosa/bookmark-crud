import {
  UseGuards,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../user/decorators';
import { CreateBookmarkRequestDTO, UpdateBookmarkRequestDTO } from './dtos';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  findAll(@GetUser('id') userId: string): Promise<
    {
      id: string;
      url: string;
      title: string;
      description: string;
      createdAt: Date;
    }[]
  > {
    return this.bookmarkService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<{
    id: string;
    url: string;
    title: string;
    description: string;
    createdAt: Date;
  }> {
    return this.bookmarkService.findOne(id, userId);
  }

  @Post()
  create(
    @GetUser('id') userId: string,
    @Body() data: CreateBookmarkRequestDTO,
  ): Promise<{ id: string; createdAt: Date }> {
    return this.bookmarkService.create(userId, data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() data: UpdateBookmarkRequestDTO,
  ): Promise<{
    id: string;
    url: string;
    title: string;
    description: string;
    updatedAt: Date;
  }> {
    return this.bookmarkService.update(id, userId, data);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return this.bookmarkService.delete(id, userId);
  }
}
