import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateMediaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  altText!: string;
}
