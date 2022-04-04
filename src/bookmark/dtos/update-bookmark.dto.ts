import { IsString, IsOptional } from 'class-validator';

export class UpdateBookmarkRequestDTO {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
