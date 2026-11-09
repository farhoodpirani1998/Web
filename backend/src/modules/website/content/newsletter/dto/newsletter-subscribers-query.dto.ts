import { IsDateString, IsOptional, MaxLength } from 'class-validator';

export class NewsletterSubscribersQueryDto {
  @IsOptional()
  @MaxLength(254)
  search?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
