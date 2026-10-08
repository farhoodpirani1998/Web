import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  // Sprint 2.3B hardening: normalized (trimmed + lowercased) before
  // validation/lookup runs. Postgres `character varying` comparison
  // (see AddAdminUsers migration — no `citext`/`LOWER()` index) is
  // case-sensitive, so without this an admin created as
  // "Admin@Example.com" could only ever log in with that exact
  // casing — a source of lockout-that-looks-like-a-bug rather than a
  // real security boundary. `CmsAuthService.login` looks up by
  // whatever `dto.email` contains, so this transform is what makes
  // that lookup case-insensitive in practice; the bootstrap script
  // applies the same normalization when creating a row so the two
  // stay consistent.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(320) // longest theoretically valid email address (RFC 3696 erratum)
  email!: string;

  // No @MinLength/complexity rules here on purpose: this validates the
  // *shape* of the request body, not password strength — a login
  // endpoint must accept whatever password an existing account was
  // created with. Complexity rules belong on account creation
  // (a future admin-management endpoint), not here. Not trimmed,
  // unlike email above: leading/trailing whitespace in a password is
  // part of the secret, and silently altering it could reject an
  // otherwise-correct password.
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password!: string;
}

