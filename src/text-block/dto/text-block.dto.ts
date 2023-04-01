import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class TextBlockDto {
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  group: string;

  image?: string;
}