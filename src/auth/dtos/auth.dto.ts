import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
