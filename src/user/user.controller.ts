import { UseGuards, Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { JwtGuard } from '../auth/guards';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { GetUser } from './decorators';
import { UpdateUserRequestDTO } from './dtos';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  findOne(@GetUser() user: User): User {
    return user;
  }

  @Patch('me')
  update(
    @GetUser('id') id: string,
    @Body() data: UpdateUserRequestDTO,
  ): Promise<{ id: string; email: string; updatedAt: Date }> {
    return this.userService.update(id, data);
  }
}
