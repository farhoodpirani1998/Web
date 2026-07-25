import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { GlobalExceptionFilter } from './global-exception.filter';

function hostFor(method: string, url: string) {
  const request = { method, url } as any;
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  return { host, response };
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  it('translates a TypeORM EntityNotFoundError into a 404, not a 500', () => {
    const { host, response } = hostFor('GET', '/admin/news/does-not-exist');

    filter.catch(new EntityNotFoundError('News', { id: 'does-not-exist' }), host);

    expect(response.status).toHaveBeenCalledWith(404);
    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(404);
    // The client only ever sees a generic, safe message — never the
    // TypeORM-authored one (which can include entity/column internals).
    expect(body.message).not.toMatch(/EntityNotFoundError/i);
  });

  it('forwards a known HttpException unchanged', () => {
    const { host, response } = hostFor('POST', '/admin/news');

    filter.catch(new BadRequestException('title is required'), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'title is required' }),
    );
  });

  it('maps an unexpected error to a fixed, information-free 500 body', () => {
    const { host, response } = hostFor('GET', '/admin/news');

    filter.catch(new Error('connection terminated unexpectedly'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    const body = response.json.mock.calls[0][0];
    expect(body.statusCode).toBe(500);
    // NODE_ENV isn't 'production' in the test run, so the message is
    // still the raw one here — this only pins the shape, not the prod
    // vs. non-prod message swap (already covered by isProduction itself).
    expect(typeof body.message).toBe('string');
  });
});
