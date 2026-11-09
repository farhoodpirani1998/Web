import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import { SiteService } from '../../core/site/site.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { clampPagination, paginate } from '../../public-api/common/pagination';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';
import { Textbook, TextbookSourceType } from './entities/textbook.entity';
import { TextbookDownloadLog } from './entities/textbook-download-log.entity';
import { TextbookAuditLog } from './entities/textbook-audit-log.entity';
import {
  TextbookTaxonomy,
  TextbookTaxonomyType,
} from './entities/textbook-taxonomy.entity';
import {
  TextbookByteRange,
  TextbookStorage,
} from './textbook-storage.interface';
import { TEXTBOOK_STORAGE } from './textbook-storage.interface';

export interface TextbookFilters {
  page: number;
  limit: number;
  stage?: string;
  grade?: string;
  field?: string;
  subject?: string;
  year?: string;
  q?: string;
  status?: PublishStatus;
  sort?: 'title' | 'year' | 'sortOrder';
  order?: 'ASC' | 'DESC';
}

const normalizePersian = (value: string): string =>
  value
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('fa');

const normalizedTitleSql = `translate(
  regexp_replace(
    replace(replace(replace(COALESCE(book.title->>'fa', ''), 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'),
    '[ًٌٍَُِّْٰ‌‍]', '', 'g'
  ),
  '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩',
  '01234567890123456789'
)`;

@Injectable()
export class TextbooksService {
  constructor(
    @InjectRepository(Textbook)
    private readonly textbooks: Repository<Textbook>,
    @InjectRepository(TextbookTaxonomy)
    private readonly taxonomies: Repository<TextbookTaxonomy>,
    @InjectRepository(TextbookDownloadLog)
    private readonly downloadLogs: Repository<TextbookDownloadLog>,
    @InjectRepository(TextbookAuditLog)
    private readonly auditLogs: Repository<TextbookAuditLog>,
    private readonly siteService: SiteService,
    @Inject(TEXTBOOK_STORAGE)
    private readonly storage: TextbookStorage,
  ) {}

  async findAll(filters: TextbookFilters, publicOnly = false) {
    const { page, limit } = clampPagination(filters.page, filters.limit);
    const siteId = this.siteService.getDefaultSiteId();
    const query = this.textbooks
      .createQueryBuilder('book')
      .where('book.siteId = :siteId', { siteId })
      .andWhere('book.deletedAt IS NULL');

    if (publicOnly)
      query.andWhere('book.status = :published', {
        published: PublishStatus.PUBLISHED,
      });
    else if (filters.status)
      query.andWhere('book.status = :status', { status: filters.status });
    if (filters.stage)
      query.andWhere('book.stage = :stage', { stage: filters.stage });
    if (filters.grade)
      query.andWhere('book.grade = :grade', { grade: filters.grade });
    if (filters.field)
      query.andWhere('book.field = :field', { field: filters.field });
    if (filters.subject)
      query.andWhere('book.subject = :subject', { subject: filters.subject });
    if (filters.year)
      query.andWhere('book.academicYear = :year', { year: filters.year });
    if (filters.q?.trim()) {
      const term = `%${normalizePersian(filters.q).replace(/[\\%_]/g, '\\$&')}%`;
      query.andWhere(
        `(${normalizedTitleSql} ILIKE :term OR translate(
          regexp_replace(replace(replace(replace(book.subject, 'ي', 'ی'), 'ى', 'ی'), 'ك', 'ک'), '[ًٌٍَُِّْٰ‌‍]', '', 'g'),
          '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789'
        ) ILIKE :term OR book.code ILIKE :term)`,
        { term },
      );
    }

    const sort =
      filters.sort === 'title'
        ? "book.title->>'fa'"
        : filters.sort === 'year'
          ? 'book.academicYear'
          : 'book.sortOrder';
    const direction = filters.order === 'DESC' ? 'DESC' : 'ASC';

    const [items, total] = await query
      .orderBy(sort, direction)
      .addOrderBy('book.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return paginate(
      items.map((book) => this.toPublicDto(book)),
      total,
      page,
      limit,
    );
  }

  async findAdmin(filters: TextbookFilters) {
    const { page, limit } = clampPagination(filters.page, filters.limit);
    const siteId = this.siteService.getDefaultSiteId();
    const query = this.textbooks
      .createQueryBuilder('book')
      .where('book.siteId = :siteId', { siteId })
      .andWhere('book.deletedAt IS NULL');
    if (filters.status)
      query.andWhere('book.status = :status', { status: filters.status });
    if (filters.stage)
      query.andWhere('book.stage = :stage', { stage: filters.stage });
    if (filters.grade)
      query.andWhere('book.grade = :grade', { grade: filters.grade });
    if (filters.q?.trim()) {
      query.andWhere(`${normalizedTitleSql} ILIKE :term`, {
        term: `%${normalizePersian(filters.q)}%`,
      });
    }
    const [items, total] = await query
      .orderBy('book.sortOrder', 'ASC')
      .addOrderBy('book.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return paginate(items, total, page, limit);
  }

  async findPublicBySlug(slug: string): Promise<Textbook> {
    const book = await this.textbooks.findOne({
      where: {
        slug,
        siteId: this.siteService.getDefaultSiteId(),
        status: PublishStatus.PUBLISHED,
        deletedAt: IsNull(),
      },
    });
    if (!book) throw new NotFoundException('کتاب پیدا نشد.');
    return book;
  }

  async findAdminById(id: string): Promise<Textbook> {
    const book = await this.textbooks.findOne({
      where: {
        id,
        siteId: this.siteService.getDefaultSiteId(),
        deletedAt: IsNull(),
      },
    });
    if (!book) throw new NotFoundException('کتاب پیدا نشد.');
    return book;
  }

  async create(dto: CreateTextbookDto): Promise<Textbook> {
    this.validateMetadata(dto);
    this.validateSource(dto.sourceType, dto.externalUrl);
    const siteId = this.siteService.getDefaultSiteId();
    const book = this.textbooks.create({
      ...dto,
      siteId,
      field: dto.field ?? null,
      edition: dto.edition ?? null,
      pageCount: dto.pageCount ?? null,
      externalUrl: dto.externalUrl ?? null,
      licenseNote: dto.licenseNote ?? null,
      fileSize: '0',
      checksum: null,
      coverKey: null,
      fileKey: null,
      status: PublishStatus.DRAFT,
      downloadCount: '0',
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.textbooks.save(book);
  }

  async update(id: string, dto: UpdateTextbookDto): Promise<Textbook> {
    this.validateMetadata(dto);
    const book = await this.findAdminById(id);
    const sourceType = dto.sourceType ?? book.sourceType;
    const externalUrl =
      dto.externalUrl !== undefined ? dto.externalUrl : book.externalUrl;
    this.validateSource(sourceType, externalUrl ?? undefined);

    const shouldDropUploadedAsset =
      book.fileKey && sourceType !== TextbookSourceType.UPLOADED;

    Object.assign(book, dto);
    if (shouldDropUploadedAsset) {
      await this.storage.remove(book.fileKey!);
      book.fileKey = null;
      book.fileSize = '0';
      book.checksum = null;
    }

    return this.textbooks.save(book);
  }

  async updateStatus(id: string, status: PublishStatus): Promise<Textbook> {
    const book = await this.findAdminById(id);
    if (status === PublishStatus.PUBLISHED) {
      if (book.sourceType === TextbookSourceType.UPLOADED && !book.fileKey) {
        throw new BadRequestException(
          'برای انتشار، ابتدا فایل PDF کتاب را بارگذاری کنید.',
        );
      }
      if (
        book.sourceType === TextbookSourceType.EXTERNAL_LINK &&
        !book.externalUrl
      ) {
        throw new BadRequestException(
          'برای انتشار، لینک رسمی کتاب الزامی است.',
        );
      }
    }
    book.status = status;
    return this.textbooks.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findAdminById(id);
    if (book.fileKey) {
      await this.storage.remove(book.fileKey);
      book.fileKey = null;
      book.fileSize = '0';
      book.checksum = null;
    }
    book.deletedAt = new Date();
    await this.textbooks.save(book);
  }

  async recordAdminAction(
    action: string,
    textbookId: string | null,
    actorId: string | null,
  ): Promise<void> {
    await this.auditLogs.save(
      this.auditLogs.create({ action, textbookId, actorId }),
    );
  }

  async upload(id: string, file: Express.Multer.File): Promise<Textbook> {
    const book = await this.findAdminById(id);
    if (book.sourceType !== TextbookSourceType.UPLOADED) {
      throw new BadRequestException('برای این کتاب منبع خارجی انتخاب شده است.');
    }
    const stored = await this.storage.save(file.buffer, file.originalname);
    const previousKey = book.fileKey;
    book.fileKey = stored.key;
    book.fileSize = String(stored.size);
    book.checksum = stored.checksum;
    try {
      const saved = await this.textbooks.save(book);
      if (previousKey) await this.storage.remove(previousKey);
      return saved;
    } catch (error) {
      await this.storage.remove(stored.key);
      throw error;
    }
  }

  async getDownload(
    slug: string,
    requesterIp?: string,
    range?: TextbookByteRange,
  ) {
    const book = await this.findPublicBySlug(slug);
    if (book.sourceType === TextbookSourceType.EXTERNAL_LINK) {
      if (
        !book.externalUrl ||
        new URL(book.externalUrl).protocol !== 'https:'
      ) {
        throw new NotFoundException('منبع دانلود کتاب در دسترس نیست.');
      }
      await this.recordDownload(book, requesterIp);
      return { redirectUrl: book.externalUrl };
    }
    if (!book.fileKey) throw new NotFoundException('فایل کتاب در دسترس نیست.');
    const file = await this.storage.open(book.fileKey, range);
    await this.recordDownload(book, requesterIp);
    return { book, file };
  }

  async listTaxonomies(type?: TextbookTaxonomyType) {
    const query = this.taxonomies
      .createQueryBuilder('taxonomy')
      .where('taxonomy.siteId = :siteId', {
        siteId: this.siteService.getDefaultSiteId(),
      });
    if (type) query.andWhere('taxonomy.type = :type', { type });
    return query
      .orderBy('taxonomy.sortOrder', 'ASC')
      .addOrderBy('taxonomy.label', 'ASC')
      .getMany();
  }

  async createTaxonomy(input: {
    type: TextbookTaxonomyType;
    value: string;
    label: string;
    sortOrder?: number;
  }) {
    return this.taxonomies.save(
      this.taxonomies.create({
        ...input,
        siteId: this.siteService.getDefaultSiteId(),
      }),
    );
  }

  async updateTaxonomy(
    id: string,
    input: Partial<{ value: string; label: string; sortOrder: number }>,
  ) {
    const taxonomy = await this.taxonomies.findOneBy({
      id,
      siteId: this.siteService.getDefaultSiteId(),
    });
    if (!taxonomy) throw new NotFoundException('مقدار دسته‌بندی پیدا نشد.');
    Object.assign(taxonomy, input);
    return this.taxonomies.save(taxonomy);
  }

  async removeTaxonomy(id: string): Promise<void> {
    const taxonomy = await this.taxonomies.findOneBy({
      id,
      siteId: this.siteService.getDefaultSiteId(),
    });
    if (!taxonomy) throw new NotFoundException('مقدار دسته‌بندی پیدا نشد.');
    await this.taxonomies.remove(taxonomy);
  }

  async getStats() {
    const siteId = this.siteService.getDefaultSiteId();
    const [mostDownloaded, byGrade] = await Promise.all([
      this.textbooks
        .createQueryBuilder('book')
        .select([
          'book.id',
          'book.title',
          'book.grade',
          'book.subject',
          'book.downloadCount',
        ])
        .where('book.siteId = :siteId', { siteId })
        .andWhere('book.deletedAt IS NULL')
        .orderBy('book.downloadCount', 'DESC')
        .limit(10)
        .getMany(),
      this.textbooks
        .createQueryBuilder('book')
        .select('book.grade', 'grade')
        .addSelect('SUM(book.downloadCount)', 'downloads')
        .where('book.siteId = :siteId', { siteId })
        .andWhere('book.deletedAt IS NULL')
        .groupBy('book.grade')
        .orderBy('SUM(book.downloadCount)', 'DESC')
        .getRawMany<{ grade: string; downloads: string }>(),
    ]);
    return { mostDownloaded, downloadsByGrade: byGrade };
  }

  private validateSource(
    sourceType: TextbookSourceType,
    externalUrl?: string | null,
  ) {
    if (sourceType === TextbookSourceType.EXTERNAL_LINK) {
      let isHttps = false;
      try {
        isHttps = !!externalUrl && new URL(externalUrl).protocol === 'https:';
      } catch {
        isHttps = false;
      }
      if (!isHttps) {
        throw new BadRequestException('لینک منبع باید از نوع HTTPS باشد.');
      }
      return;
    }
    if (externalUrl)
      throw new BadRequestException('لینک خارجی برای منبع آپلودشده مجاز نیست.');
  }

  private validateMetadata(dto: CreateTextbookDto | UpdateTextbookDto) {
    if (
      dto.title !== undefined &&
      (!dto.title || typeof dto.title.fa !== 'string' || !dto.title.fa.trim())
    ) {
      throw new BadRequestException('عنوان فارسی کتاب الزامی است.');
    }
    if (
      dto.slug !== undefined &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dto.slug)
    ) {
      throw new BadRequestException(
        'شناسهٔ کتاب باید به‌صورت حروف کوچک انگلیسی و خط تیره باشد.',
      );
    }
    for (const value of [
      dto.code,
      dto.stage,
      dto.grade,
      dto.subject,
      dto.academicYear,
    ]) {
      if (value !== undefined && !value.trim()) {
        throw new BadRequestException(
          'فیلدهای کد، مقطع، پایه، درس و سال تحصیلی نباید خالی باشند.',
        );
      }
    }
  }

  private async recordDownload(book: Textbook, requesterIp?: string) {
    await this.textbooks.increment({ id: book.id }, 'downloadCount', 1);
    await this.downloadLogs.save(
      this.downloadLogs.create({
        textbookId: book.id,
        requesterHash: requesterIp
          ? createHash('sha256').update(requesterIp).digest('hex')
          : null,
      }),
    );
  }

  private toPublicDto(book: Textbook) {
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
      status: book.status,
      sortOrder: book.sortOrder,
      downloadCount: book.downloadCount,
      createdAt: book.createdAt,
      coverUrl: null,
      downloadUrl: `/api/public/textbooks/${encodeURIComponent(book.slug)}/download`,
    };
  }
}
