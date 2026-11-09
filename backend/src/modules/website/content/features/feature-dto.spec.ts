import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateFeatureDto } from './dto/create-feature.dto';
import { FeatureIcon } from './feature-icon.enum';

describe('CreateFeatureDto icon validation', () => {
  it('accepts a key from the public ICON_MAP and rejects an unknown key', async () => {
    const createDto = (icon: string) =>
      plainToInstance(CreateFeatureDto, {
        title: { fa: 'عنوان' },
        description: { fa: 'توضیح' },
        icon,
      });

    expect(await validate(createDto(FeatureIcon.MONITOR))).toHaveLength(0);
    expect(await validate(createDto('UnknownIcon'))).not.toHaveLength(0);
  });
});
