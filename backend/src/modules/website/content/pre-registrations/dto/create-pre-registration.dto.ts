import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Body for `POST /public/pre-registration`. One field per
 * `RegistrationForm.tsx` input — `studentGrade` is validated as a
 * non-empty string rather than `@IsIn([...])` against the form's
 * current option list, same reasoning as the entity comment: that list
 * is frontend-owned UI copy, not a backend-enforced enum.
 */
export class CreatePreRegistrationDto {
  @IsString()
  @MinLength(1)
  studentFirstName!: string;

  @IsString()
  @MinLength(1)
  studentLastName!: string;

  @IsString()
  @MinLength(1)
  studentNationalId!: string;

  @IsDateString()
  studentBirthDate!: string;

  @IsString()
  @MinLength(1)
  studentGrade!: string;

  @IsString()
  @MinLength(1)
  guardianFullName!: string;

  @IsString()
  @MinLength(1)
  guardianPhone!: string;

  // Optional on the form ("ایمیل (اختیاری)").
  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  // Optional on the form ("توضیحات (اختیاری)").
  @IsOptional()
  @IsString()
  notes?: string;
}
