import { IsString, Matches, MaxLength } from 'class-validator';

// Lowercase kebab-case only — e.g. "header", "footer-secondary". Kept
// local to Navigation, same convention as Pages/News' own slug pattern
// (duplicated per module rather than factored into a shared validator).
const KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateMenuDto {
  @IsString()
  @MaxLength(100)
  @Matches(KEY_PATTERN, {
    message: 'key must be lowercase kebab-case (e.g. "header")',
  })
  key!: string;

  @IsString()
  @MaxLength(200)
  name!: string;
}
