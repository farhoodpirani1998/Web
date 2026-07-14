import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  altText!: string;
}
