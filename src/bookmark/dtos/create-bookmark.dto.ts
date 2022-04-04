import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookmarkRequestDTO {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
