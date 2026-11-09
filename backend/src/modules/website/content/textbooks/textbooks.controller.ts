import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response as ExpressResponse } from 'express';
import { PUBLIC_THROTTLE } from '../../public-api/common/public-rate-limit.constants';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';
import { UpdateTextbookStatusDto } from './dto/update-textbook-status.dto';
import { TextbookTaxonomyDto } from './dto/textbook-taxonomy.dto';
import { TextbookTaxonomyType } from './entities/textbook-taxonomy.entity';
import { TextbooksService } from './textbooks.service';

type AuthenticatedRequest = {
  ip?: string;
  user?: { id?: string; sub?: string };
};

@Controller('admin/textbooks')
export class TextbooksController {
  constructor(private readonly textbooks: TextbooksService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('q') q?: string,
    @Query('status') status?: PublishStatus,
    @Query('stage') stage?: string,
    @Query('grade') grade?: string,
    @Query('field') field?: string,
    @Query('subject') subject?: string,
    @Query('year') year?: string,
  ) {
    return this.textbooks.findAdmin({
      page,
      limit,
      q,
      status,
      stage,
      grade,
      field,
      subject,
      year,
    });
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.textbooks.findAdminById(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async create(
    @Body() dto: CreateTextbookDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const book = await this.textbooks.create(dto);
    await this.audit('create', book.id, request);
    return book;
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTextbookDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const book = await this.textbooks.update(id, dto);
    await this.audit('update', book.id, request);
    return book;
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTextbookStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const book = await this.textbooks.updateStatus(id, dto.status);
    await this.audit('status', book.id, request);
    return book;
  }

  @Post(':id/file')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async upload(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!file) throw new BadRequestException('فایل PDF الزامی است.');
    const book = await this.textbooks.upload(id, file);
    await this.audit('upload', book.id, request);
    return book;
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.textbooks.remove(id);
    await this.audit('delete', id, request);
    return { success: true };
  }

  @Get('stats')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  stats() {
    return this.textbooks.getStats();
  }

  private audit(action: string, id: string, request: AuthenticatedRequest) {
    return this.textbooks.recordAdminAction(
      action,
      id,
      request.user?.id ?? request.user?.sub ?? null,
    );
  }
}

@Controller('admin/textbooks/taxonomies')
export class TextbookTaxonomiesController {
  constructor(private readonly textbooks: TextbooksService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  list(@Query('type') type?: TextbookTaxonomyType) {
    return this.textbooks.listTaxonomies(type);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async create(
    @Body() body: TextbookTaxonomyDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const taxonomy = await this.textbooks.createTaxonomy(body);
    await this.textbooks.recordAdminAction(
      'taxonomy-create',
      null,
      request.user?.id ?? request.user?.sub ?? null,
    );
    return taxonomy;
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<TextbookTaxonomyDto>,
    @Req() request: AuthenticatedRequest,
  ) {
    const taxonomy = await this.textbooks.updateTaxonomy(id, body);
    await this.textbooks.recordAdminAction(
      'taxonomy-update',
      null,
      request.user?.id ?? request.user?.sub ?? null,
    );
    return taxonomy;
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.textbooks.removeTaxonomy(id);
    await this.textbooks.recordAdminAction(
      'taxonomy-delete',
      null,
      request.user?.id ?? request.user?.sub ?? null,
    );
    return { success: true };
  }
}

@Controller('public/textbooks')
@UseGuards(ThrottlerGuard)
@Throttle(PUBLIC_THROTTLE)
export class PublicTextbooksController {
  constructor(private readonly textbooks: TextbooksService) {}

  @Get()
  async findAll(
    @Res({ passthrough: true }) response: ExpressResponse,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('stage') stage?: string,
    @Query('grade') grade?: string,
    @Query('field') field?: string,
    @Query('subject') subject?: string,
    @Query('year') year?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: 'title' | 'year' | 'sortOrder',
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    response.setHeader(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300',
    );
    return this.textbooks.findAll(
      {
        page,
        limit,
        stage,
        grade,
        field,
        subject,
        year,
        q,
        sort,
        order,
      },
      true,
    );
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    response.setHeader(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300',
    );
    const book = await this.textbooks.findPublicBySlug(slug);
    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      code: book.code,
      stage: book.stage,
      grade: book.grade,
      field: book.field,
      subject: book.subject,
      academicYear: book.academicYear,
      edition: book.edition,
      pageCount: book.pageCount,
      fileSize: book.fileSize,
      sourceType: book.sourceType,
      sourceAttribution: book.sourceAttribution,
      licenseNote: book.licenseNote,
      downloadCount: book.downloadCount,
      createdAt: book.createdAt,
      downloadUrl: `/api/public/textbooks/${encodeURIComponent(book.slug)}/download`,
    };
  }

  @Get(':slug/download')
  async download(
    @Param('slug') slug: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: ExpressResponse,
    @Headers('range') rangeHeader?: string,
    @Headers('if-none-match') ifNoneMatch?: string,
  ) {
    const book = await this.textbooks.findPublicBySlug(slug);
    if (book.sourceType === 'EXTERNAL_LINK') {
      const external = await this.textbooks.getDownload(slug, request.ip);
      if (!('redirectUrl' in external)) throw new BadRequestException();
      const redirectUrl = external.redirectUrl;
      if (!redirectUrl) {
        throw new BadRequestException('لینک دانلود معتبر نیست.');
      }
      response.redirect(302, redirectUrl);
      return;
    }

    const size = Number(book.fileSize);
    let range: { start: number; end: number } | undefined;
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (!match || (!match[1] && !match[2])) {
        response.setHeader('Content-Range', `bytes */${size}`);
        response.status(416).end();
        return;
      }
      const start = match[1]
        ? Number(match[1])
        : Math.max(0, size - Number(match[2]));
      const end = match[2] && match[1] ? Number(match[2]) : size - 1;
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start > end ||
        start >= size
      ) {
        response.setHeader('Content-Range', `bytes */${size}`);
        response.status(416).end();
        return;
      }
      range = { start, end: Math.min(end, size - 1) };
    }
    const result = await this.textbooks.getDownload(slug, request.ip, range);
    if ('redirectUrl' in result) {
      const redirectUrl = result.redirectUrl;
      if (!redirectUrl) {
        throw new BadRequestException('لینک دانلود معتبر نیست.');
      }
      response.redirect(302, redirectUrl);
      return;
    }
    const { file } = result;
    response.setHeader('ETag', file.etag);
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    if (ifNoneMatch === file.etag && !range) {
      file.stream.destroy();
      response.status(304).end();
      return;
    }
    const length = file.end - file.start + 1;
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Length', String(length));
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="textbook.pdf"; filename*=UTF-8''${encodeURIComponent(book.title.fa)}.pdf`,
    );
    if (range) {
      response.status(206);
      response.setHeader(
        'Content-Range',
        `bytes ${file.start}-${file.end}/${file.size}`,
      );
    } else {
      response.status(200);
    }
    file.stream.on('error', () => response.status(500).end());
    file.stream.pipe(response);
  }
}
