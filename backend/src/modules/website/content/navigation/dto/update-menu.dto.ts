import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class UpdateMenuDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(KEY_PATTERN, {
    message: 'key must be lowercase kebab-case (e.g. "header")',
  })
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
