import { PATH_METADATA } from '@nestjs/common/constants';
import {
  PublicTextbooksController,
  TextbooksController,
} from './textbooks.controller';

describe('TextbooksController route ordering', () => {
  it('registers stats before the wildcard :id route so stats is not shadowed', () => {
    const prototype = TextbooksController.prototype;
    const names = Object.getOwnPropertyNames(prototype);
    const statsIndex = names.indexOf('stats');
    const findOneIndex = names.indexOf('findOne');

    expect(statsIndex).toBeGreaterThan(-1);
    expect(findOneIndex).toBeGreaterThan(-1);
    expect(statsIndex).toBeLessThan(findOneIndex);
    expect(Reflect.getMetadata(PATH_METADATA, prototype.stats)).toBe('stats');
    expect(Reflect.getMetadata(PATH_METADATA, prototype.findOne)).toBe(':id');
  });
});

describe('PublicTextbooksController download counts', () => {
  it.each([
    { status: 200, range: undefined, start: 0, end: 9 },
    { status: 206, range: 'bytes=2-5', start: 2, end: 5 },
  ])(
    'counts a successful $status file response',
    async ({ status, range, start, end }) => {
      const book = {
        sourceType: 'UPLOADED',
        fileSize: '10',
        title: { fa: 'کتاب نمونه' },
      };
      const file = {
        etag: '"book-etag"',
        start,
        end,
        size: 10,
        stream: { destroy: jest.fn(), on: jest.fn(), pipe: jest.fn() },
      };
      const textbooks = {
        findPublicBySlug: jest.fn().mockResolvedValue(book),
        getDownload: jest.fn().mockResolvedValue({ book, file }),
        recordDownload: jest.fn(),
      };
      const controller = new PublicTextbooksController(textbooks as any);
      const response = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
      };

      await controller.download(
        'sample-book',
        { ip: '192.0.2.1' },
        response as any,
        range,
      );

      expect(response.status).toHaveBeenCalledWith(status);
      expect(textbooks.recordDownload).toHaveBeenCalledWith(book, '192.0.2.1');
      expect(file.stream.pipe).toHaveBeenCalledWith(response);
    },
  );

  it('does not count a matching ETag response served as 304', async () => {
    const file = {
      etag: '"book-etag"',
      stream: { destroy: jest.fn(), on: jest.fn(), pipe: jest.fn() },
    };
    const textbooks = {
      findPublicBySlug: jest.fn().mockResolvedValue({
        sourceType: 'UPLOADED',
        fileSize: '10',
      }),
      getDownload: jest.fn().mockResolvedValue({ file }),
      recordDownload: jest.fn(),
    };
    const controller = new PublicTextbooksController(textbooks as any);
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    await controller.download(
      'sample-book',
      { ip: '192.0.2.1' },
      response as any,
      undefined,
      '"book-etag"',
    );

    expect(response.status).toHaveBeenCalledWith(304);
    expect(file.stream.destroy).toHaveBeenCalled();
    expect(textbooks.recordDownload).not.toHaveBeenCalled();
  });
});
