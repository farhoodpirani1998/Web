import { BadRequestException } from '@nestjs/common';
import { CampusScopeService } from './campus-scope.service';

describe('CampusScopeService', () => {
  const campusRepository = {
    findOne: jest.fn(),
  };
  const service = new CampusScopeService(campusRepository as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters a campus list to the selected campus and shared rows', () => {
    const query = { andWhere: jest.fn().mockReturnThis() };

    service.applyPublicFilter(query as any, 'article', 'campus-1');

    expect(query.andWhere).toHaveBeenCalledWith(
      '(article.campusId = :campusId OR article.campusId IS NULL)',
      { campusId: 'campus-1' },
    );
  });

  it('leaves group-level queries unfiltered', () => {
    const query = { andWhere: jest.fn().mockReturnThis() };

    service.applyPublicFilter(query as any, 'article');

    expect(query.andWhere).not.toHaveBeenCalled();
  });

  it('rejects a campus that does not belong to the content site', async () => {
    campusRepository.findOne.mockResolvedValue(null);

    await expect(
      service.assertCampusBelongsToSite('site-1', 'campus-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
