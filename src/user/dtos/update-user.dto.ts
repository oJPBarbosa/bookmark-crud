import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDTO {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
