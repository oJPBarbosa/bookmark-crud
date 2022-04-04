import { Controller, HttpCode, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDTO } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('signin')
  signin(@Body() data: AuthRequestDTO): Promise<{ token: string }> {
    return this.authService.signin(data);
  }

  @Post('register')
  register(
    @Body() data: AuthRequestDTO,
  ): Promise<{ id: string; createdAt: Date }> {
    return this.authService.register(data);
  }
}
