import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateNewsArticleDto } from '../news/dto/create-news-article.dto';
import { UpdateNewsArticleDto } from '../news/dto/update-news-article.dto';
import { CreateCalendarEventDto } from '../events/dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from '../events/dto/update-calendar-event.dto';
import { CreateAdmissionEntryDto } from '../admissions/dto/create-admission-entry.dto';
import { UpdateAdmissionEntryDto } from '../admissions/dto/update-admission-entry.dto';
import { CreateTeacherDto } from '../teachers/dto/create-teacher.dto';
import { UpdateTeacherDto } from '../teachers/dto/update-teacher.dto';

describe('Campus content DTO validation', () => {
  it.each([
    CreateNewsArticleDto,
    UpdateNewsArticleDto,
    CreateCalendarEventDto,
    UpdateCalendarEventDto,
    CreateAdmissionEntryDto,
    UpdateAdmissionEntryDto,
    CreateTeacherDto,
    UpdateTeacherDto,
  ])('validates campusId on %p', async (Dto) => {
    const valid = plainToInstance(Dto, {
      campusId: '2a1e2e60-0ed5-4db4-b826-20f592b0878e',
    });
    const invalid = plainToInstance(Dto, { campusId: 'not-a-uuid' });

    expect(await validate(valid)).not.toContainEqual(
      expect.objectContaining({ property: 'campusId' }),
    );
    expect((await validate(invalid)).map((error) => error.property)).toContain(
      'campusId',
    );
  });
});
