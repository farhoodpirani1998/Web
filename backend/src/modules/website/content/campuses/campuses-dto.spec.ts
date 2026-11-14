import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';

describe('Campus coordinate DTO validation', () => {
  it.each([
    [{ latitude: -90, longitude: 180 }, true],
    [{ latitude: -90.01, longitude: 0 }, false],
    [{ latitude: 0, longitude: 180.01 }, false],
    [{ latitude: null, longitude: null }, true],
  ])('validates coordinate bounds %#', async (coordinates, valid) => {
    const errors = await validate(
      plainToInstance(UpdateCampusDto, coordinates),
    );
    expect(errors.length === 0).toBe(valid);
  });

  it('accepts in-range coordinates on create', async () => {
    const dto = plainToInstance(CreateCampusDto, {
      title: { fa: 'پردیس' },
      slug: 'test-campus',
      body: { fa: 'توضیحات' },
      latitude: 35.7,
      longitude: 51.42,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it.each([
    [{ latitude: -90.01, longitude: 0 }],
    [{ latitude: 0, longitude: 180.01 }],
  ])('rejects out-of-range coordinates on create %#', async (coordinates) => {
    const dto = plainToInstance(CreateCampusDto, {
      title: { fa: 'پردیس' },
      slug: 'test-campus',
      body: { fa: 'توضیحات' },
      ...coordinates,
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('validates grade levels as unique string arrays', async () => {
    const valid = plainToInstance(UpdateCampusDto, {
      gradeLevels: ['grade-1', 'grade-2'],
    });
    const invalid = plainToInstance(UpdateCampusDto, {
      gradeLevels: ['grade-1', 'grade-1'],
    });

    expect(await validate(valid)).toHaveLength(0);
    expect(await validate(invalid)).not.toHaveLength(0);
  });
});
