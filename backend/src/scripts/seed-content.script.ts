import { config } from 'dotenv';
import { deflateSync } from 'zlib';

config();

/**
 * One-time content seed for the CMS, driven through the **admin API**
 * (not direct DB writes) so it exercises the exact same create / publish
 * paths the admin panel uses.
 *
 * Why this exists: the public site's sections are written "API first,
 * mock as fallback" — `items = data.length ? data : placeholder`. The DB
 * starts empty, so every section falls back to its hard-coded Persian
 * placeholder. This script lifts that placeholder content into real CMS
 * rows (published), so the site renders CMS data and every field becomes
 * editable in the admin panel.
 *
 * Idempotent: each module is skipped if it already has rows, so running
 * it twice is a no-op. Safe to re-run after adding new modules.
 *
 * Usage:
 *   CMS_SEED_ADMIN_PASSWORD='...' npm run seed:content
 *   (optionally CMS_SEED_API_BASE / CMS_SEED_ADMIN_EMAIL)
 */

const API_BASE = process.env.CMS_SEED_API_BASE ?? 'http://127.0.0.1:3100/admin';
const ADMIN_EMAIL = process.env.CMS_SEED_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.CMS_SEED_ADMIN_PASSWORD;

type Json = Record<string, unknown>;
const fa = (value: string): { fa: string } => ({ fa: value });

let TOKEN = '';
let created = 0;
let skipped = 0;

// --- tiny valid-PNG generator (no dependency) -------------------------------

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

/** A flat-color PNG — a real, magic-byte-valid image the media endpoint accepts. */
function makePng(
  width: number,
  height: number,
  rgb: [number, number, number],
): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0; // no filter
  for (let x = 0; x < width; x += 1) {
    row[1 + x * 3] = rgb[0];
    row[2 + x * 3] = rgb[1];
    row[3 + x * 3] = rgb[2];
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- HTTP helpers -----------------------------------------------------------

async function api(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    throw new Error(
      `${method} ${path} -> ${res.status}: ${text.slice(0, 400)}`,
    );
  }
  return parsed;
}

async function uploadMedia(altText: string, png: Buffer): Promise<string> {
  const form = new FormData();
  form.append(
    'file',
    new Blob([new Uint8Array(png)], { type: 'image/png' }),
    'placeholder.png',
  );
  form.append('altText', altText);
  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`POST /media -> ${res.status}: ${text.slice(0, 300)}`);
  const media = JSON.parse(text) as { id: string };
  return media.id;
}

/** Returns the current rows of a list endpoint (empty array when none). */
async function existingRows(path: string): Promise<unknown[]> {
  const rows = await api('GET', path);
  return Array.isArray(rows) ? rows : [];
}

/** Creates the item, then publishes it. Returns the new id. */
async function createAndPublish(path: string, dto: Json): Promise<string> {
  const item = (await api('POST', path, dto)) as { id: string };
  await api('PATCH', `${path}/${item.id}/status`, { status: 'published' });
  created += 1;
  return item.id;
}

/**
 * Publishes a singleton resource that may already be published. The
 * publish endpoint rejects a same-status transition
 * (`published -> published`) with a 400, so this swallows exactly that
 * case — making repeated seed runs idempotent — and rethrows anything
 * else.
 */
async function publishSingleton(path: string): Promise<void> {
  try {
    await api('PATCH', `${path}/status`, { status: 'published' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('Invalid publish transition')) throw err;
  }
}

async function seedList(
  label: string,
  path: string,
  items: Json[],
  publish = true,
): Promise<void> {
  const rows = await existingRows(path);
  if (rows.length > 0) {
    console.log(`  · ${label}: already has ${rows.length} rows — skipped`);
    skipped += 1;
    return;
  }
  if (publish) {
    for (const item of items) await createAndPublish(path, item);
    console.log(`  ✓ ${label}: created + published ${items.length}`);
  } else {
    // Some modules (e.g. portal-links) have no draft/publish lifecycle —
    // they're live as soon as they're created, keyed by a `visible` flag
    // instead of `status`.
    for (const item of items) {
      await api('POST', path, item);
      created += 1;
    }
    console.log(`  ✓ ${label}: created ${items.length}`);
  }
}

// --- content (transcribed from the site's current placeholders) -------------

async function seed(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      'Set CMS_SEED_ADMIN_PASSWORD before running (the seed logs in as the CMS admin).',
    );
  }

  console.log(`Seeding ${API_BASE} as ${ADMIN_EMAIL}\n`);

  const login = (await api('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })) as { accessToken: string };
  TOKEN = login.accessToken;

  // --- media (uploaded first; referenced by id below) -----------------------
  console.log('Media:');
  const imgHero = await uploadMedia(
    'تصویر بخش هدر',
    makePng(1200, 640, [15, 45, 82]),
  );
  const imgAbout = await uploadMedia(
    'تصویر بخش درباره ما',
    makePng(900, 700, [201, 162, 39]),
  );
  const imgCampus = await uploadMedia(
    'تصویر پردیس',
    makePng(800, 560, [30, 64, 110]),
  );
  const imgTeacher = await uploadMedia(
    'تصویر مدرس',
    makePng(400, 400, [10, 30, 56]),
  );
  const imgEvent = await uploadMedia(
    'تصویر رویداد',
    makePng(800, 500, [46, 80, 130]),
  );
  const imgNews = await uploadMedia(
    'تصویر خبر',
    makePng(800, 500, [22, 48, 88]),
  );
  const galleryImages: string[] = [];
  const galleryColors: [number, number, number][] = [
    [15, 45, 82],
    [201, 162, 39],
    [30, 64, 110],
    [46, 80, 130],
    [22, 48, 88],
    [60, 96, 156],
    [10, 30, 56],
    [150, 118, 20],
  ];
  for (const [i, rgb] of galleryColors.entries()) {
    galleryImages.push(
      await uploadMedia(`تصویر گالری ${i + 1}`, makePng(700, 520, rgb)),
    );
  }
  const imgLogo = await uploadMedia(
    'لوگوی مجموعه',
    makePng(256, 256, [15, 45, 82]),
  );
  console.log(`  ✓ uploaded ${7 + galleryImages.length} placeholder images`);

  // --- list modules ---------------------------------------------------------
  console.log('\nContent modules:');

  await seedList('hero', '/hero-slides', [
    {
      heading: fa('آینده‌ای روشن با گروه آموزشی ندای حقیقت'),
      subheading: fa(
        'با بهره‌گیری از اساتید مجرب و متدهای روز دنیا، مسیر موفقیت تحصیلی و فردی دانش‌آموزان را هموار می‌کنیم.',
      ),
      ctaLabel: fa('پیش‌ثبت‌نام'),
      ctaUrl: '/pre-registration',
      backgroundMediaId: imgHero,
    },
  ]);

  await seedList('features', '/features', [
    {
      title: fa('کلاس‌های هوشمند'),
      description: fa(
        'تجهیز کلاس‌ها به ابزارهای آموزشی دیجیتال برای یادگیری تعاملی‌تر.',
      ),
      icon: 'Monitor',
    },
    {
      title: fa('آزمایشگاه مجهز'),
      description: fa(
        'فضای عملی برای تجربه‌ی مستقیم علوم پایه در کنار آموزش نظری.',
      ),
      icon: 'FlaskConical',
    },
    {
      title: fa('کتابخانه‌ی غنی'),
      description: fa(
        'مجموعه‌ای گسترده از منابع مطالعاتی برای تقویت عادت کتاب‌خوانی.',
      ),
      icon: 'BookOpen',
    },
    {
      title: fa('امکانات ورزشی'),
      description: fa(
        'فضاهای استاندارد ورزشی برای رشد جسمی و روحیه‌ی تیمی دانش‌آموزان.',
      ),
      icon: 'Dumbbell',
    },
    {
      title: fa('آموزش زبان'),
      description: fa(
        'برنامه‌ی فشرده‌ی زبان خارجی با تمرکز بر مهارت‌های گفتاری و نوشتاری.',
      ),
      icon: 'Globe',
    },
    {
      title: fa('فعالیت‌های فرهنگی و هنری'),
      description: fa(
        'کارگاه‌های موسیقی و هنر برای پرورش خلاقیت در کنار آموزش رسمی.',
      ),
      icon: 'Music',
    },
  ]);

  await seedList('faq', '/faqs', [
    {
      question: fa('اخبار و اطلاعیه‌ها چند وقت یک‌بار به‌روزرسانی می‌شوند؟'),
      answer: fa(
        'متن نمونه پاسخ درباره دوره‌های انتشار اخبار و اطلاعیه‌های جدید.',
      ),
    },
    {
      question: fa('آیا امکان دریافت اطلاع‌رسانی خبرها وجود دارد؟'),
      answer: fa(
        'متن نمونه پاسخ درباره روش‌های اطلاع‌رسانی اخبار به اولیا و دانش‌آموزان.',
      ),
    },
    {
      question: fa('آیا امکان مشاهده اخبار قدیمی‌تر وجود دارد؟'),
      answer: fa(
        'متن نمونه پاسخ درباره دسترسی به آرشیو اخبار و اطلاعیه‌های پیشین.',
      ),
    },
    {
      question: fa('چگونه می‌توان خبری را برای انتشار پیشنهاد داد؟'),
      answer: fa(
        'متن نمونه پاسخ درباره روش هماهنگی برای پیشنهاد و ارسال خبر جهت انتشار.',
      ),
    },
  ]);

  await seedList('statistics', '/statistics', [
    { label: fa('سال تأسیس'), value: 1378 },
    { label: fa('دانش‌آموز و دانشجو'), value: 12000, suffix: '+' },
    { label: fa('شعبه فعال'), value: 6 },
    { label: fa('مدرس و کارشناس'), value: 400, suffix: '+' },
    { label: fa('فارغ‌التحصیل'), value: 8500, suffix: '+' },
    { label: fa('دوره آموزشی'), value: 60, suffix: '+' },
    { label: fa('رضایت خانواده‌ها'), value: 96, suffix: '٪' },
    { label: fa('رتبه برتر کنکور'), value: 200, suffix: '+' },
  ]);

  await seedList('news', '/news', [
    {
      title: fa('آغاز ثبت‌نام دوره‌های نیم‌سال جدید'),
      slug: 'nim-sal-jadid',
      category: 'اطلاعیه',
      excerpt: fa(
        'متن نمونه درباره زمان‌بندی ثبت‌نام، مدارک مورد نیاز و نحوه انتخاب شعبه برای دوره‌های پیش رو.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره زمان‌بندی دقیق ثبت‌نام، مدارک مورد نیاز، شرایط انتخاب شعبه و مراحل تکمیل ثبت‌نام برای دوره‌های نیم‌سال جدید.',
      ),
      featuredImageMediaId: imgNews,
    },
    {
      title: fa('برگزاری نشست معرفی مسیرهای تحصیلی'),
      slug: 'nashast-masir-tahsili',
      category: 'رویداد',
      excerpt: fa(
        'متن نمونه درباره یک نشست حضوری با حضور مشاوران تحصیلی برای آشنایی خانواده‌ها با مسیرهای پیش رو.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره زمان و مکان برگزاری نشست، سرفصل‌های ارائه‌شده توسط مشاوران تحصیلی و نحوه هماهنگی برای حضور خانواده‌ها.',
      ),
      featuredImageMediaId: imgNews,
    },
    {
      title: fa('کسب رتبه‌های برتر توسط دانش‌آموزان مجموعه'),
      slug: 'rotebe-bartar',
      category: 'دستاورد',
      excerpt: fa(
        'متن نمونه درباره درخشش گروهی از دانش‌آموزان در آزمون‌های ملی و افتخارآفرینی برای مجموعه.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره آزمون‌های ملی مورد اشاره، تعداد و رتبه دانش‌آموزان درخشان، و برنامه‌های تقدیر از ایشان.',
      ),
      featuredImageMediaId: imgNews,
    },
    {
      title: fa('تغییر ساعت کاری شعب در ایام تعطیل'),
      slug: 'taghir-saat-kari',
      category: 'اطلاعیه',
      excerpt: fa(
        'متن نمونه درباره ساعات کاری ویژه شعب در روزهای تعطیل و نحوه هماهنگی برای مراجعه حضوری.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره بازه دقیق تعطیلات، ساعات کاری ویژه هر شعبه در این بازه، و راه‌های تماس برای هماهنگی مراجعه حضوری.',
      ),
      featuredImageMediaId: imgNews,
    },
    {
      title: fa('کارگاه آموزشی ویژه اولیا'),
      slug: 'kargah-avalia',
      category: 'رویداد',
      excerpt: fa(
        'متن نمونه درباره برگزاری کارگاهی برای آشنایی اولیا با روش‌های همراهی تحصیلی فرزندان.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره سرفصل‌های کارگاه، مدرسان حاضر، و نحوه ثبت‌نام اولیای علاقه‌مند به شرکت.',
      ),
      featuredImageMediaId: imgNews,
    },
    {
      title: fa('افتتاح شعبه جدید در کرج'),
      slug: 'eftetah-shobe-karaj',
      category: 'دستاورد',
      excerpt: fa(
        'متن نمونه درباره افتتاح شعبه‌ای تازه و امکانات آموزشی در نظر گرفته‌شده برای دانش‌آموزان منطقه.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره موقعیت شعبه جدید، امکانات آموزشی و رفاهی آن، و ظرفیت پذیرش دانش‌آموزان منطقه کرج.',
      ),
      featuredImageMediaId: imgNews,
    },
  ]);

  await seedList('campuses', '/campuses', [
    {
      title: fa('پردیس مرکزی'),
      slug: 'central',
      excerpt: fa('متن نمونه معرفی کوتاه برای پردیس مرکزی.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره پردیس مرکزی، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.',
      ),
      area: fa('تهران، مرکز شهر'),
      address: fa('خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲'),
      phone: '۰۲۱-۱۲۳۴۵۶۷۸',
      features: ['کتابخانه', 'سالن ورزشی', 'آزمایشگاه علوم', 'کارگاه رایانه'],
      featuredImageMediaId: imgCampus,
    },
    {
      title: fa('پردیس غرب تهران'),
      slug: 'west',
      excerpt: fa('متن نمونه معرفی کوتاه برای پردیس غرب تهران.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره پردیس غرب تهران، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.',
      ),
      area: fa('تهران، منطقه غرب'),
      address: fa('بلوار اشرفی اصفهانی، خیابان نمونه، پلاک ۴۵'),
      phone: '۰۲۱-۲۳۴۵۶۷۸۹',
      features: ['سالن ورزشی', 'زمین بازی', 'کارگاه هنر'],
      featuredImageMediaId: imgCampus,
    },
    {
      title: fa('پردیس اصفهان'),
      slug: 'isfahan',
      excerpt: fa('متن نمونه معرفی کوتاه برای پردیس اصفهان.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره پردیس اصفهان، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.',
      ),
      area: fa('اصفهان'),
      address: fa('خیابان چهارباغ، خیابان نمونه، پلاک ۵۶'),
      phone: '۰۳۱-۱۲۳۴۵۶۷۸',
      email: 'isfahan@example.com',
      features: ['کتابخانه', 'آزمایشگاه علوم', 'سالن آمفی‌تئاتر'],
      featuredImageMediaId: imgCampus,
    },
    {
      title: fa('پردیس مشهد'),
      slug: 'mashhad',
      excerpt: fa('متن نمونه معرفی کوتاه برای پردیس مشهد.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره پردیس مشهد، امکانات آموزشی و رفاهی آن، و فضای کلی مجموعه.',
      ),
      area: fa('خراسان رضوی، مشهد'),
      address: fa('بلوار وکیل‌آباد، خیابان نمونه، پلاک ۸۹'),
      phone: '۰۵۱-۱۲۳۴۵۶۷۸',
      features: ['کتابخانه', 'کارگاه رایانه', 'زمین بازی'],
      featuredImageMediaId: imgCampus,
    },
  ]);

  await seedList('teachers', '/teachers', [
    {
      fullName: 'دکتر حسینی',
      slug: 'hosseini',
      jobTitle: fa('دبیر ریاضی'),
      bio: fa('متن نمونه معرفی کوتاه برای دبیر ریاضی و سابقه تدریس ایشان.'),
      specialties: ['دکترای ریاضی محض', 'مدرس کنکور', '۱۵ سال سابقه تدریس'],
      avatarMediaId: imgTeacher,
    },
    {
      fullName: 'خانم احمدی',
      slug: 'ahmadi',
      jobTitle: fa('دبیر ادبیات فارسی'),
      bio: fa(
        'متن نمونه معرفی کوتاه برای دبیر ادبیات فارسی و سابقه تدریس ایشان.',
      ),
      specialties: ['کارشناسی ارشد ادبیات فارسی', 'مدرس کارگاه نویسندگی'],
      avatarMediaId: imgTeacher,
    },
    {
      fullName: 'آقای کریمی',
      slug: 'karimi',
      jobTitle: fa('دبیر فیزیک'),
      bio: fa('متن نمونه معرفی کوتاه برای دبیر فیزیک و سابقه تدریس ایشان.'),
      specialties: [
        'کارشناسی ارشد فیزیک',
        'مدرس المپیاد',
        '۱۰ سال سابقه تدریس',
      ],
      avatarMediaId: imgTeacher,
    },
    {
      fullName: 'خانم رضایی',
      slug: 'rezaei',
      jobTitle: fa('دبیر زبان انگلیسی'),
      bio: fa(
        'متن نمونه معرفی کوتاه برای دبیر زبان انگلیسی و سابقه تدریس ایشان.',
      ),
      specialties: ['مدرک بین‌المللی تدریس زبان', 'مدرس دوره‌های آیلتس'],
      avatarMediaId: imgTeacher,
    },
  ]);

  await seedList('events', '/events', [
    {
      title: fa('روز خانواده'),
      slug: 'family-day',
      excerpt: fa('متن نمونه معرفی کوتاه برای رویداد روز خانواده.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره برنامه روز خانواده، فعالیت‌های پیش‌بینی‌شده و نحوه حضور خانواده‌ها.',
      ),
      category: 'رویداد فرهنگی',
      location: fa('پردیس مرکزی'),
      startAt: '2026-11-06T09:00:00.000Z',
      featuredImageMediaId: imgEvent,
    },
    {
      title: fa('جشن فارغ‌التحصیلی'),
      slug: 'graduation-ceremony',
      excerpt: fa('متن نمونه معرفی کوتاه برای جشن فارغ‌التحصیلی دانش‌آموزان.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره برنامه جشن فارغ‌التحصیلی، اهدای گواهی‌نامه‌ها و برنامه‌های جانبی مراسم.',
      ),
      category: 'جشن مدرسه',
      location: fa('سالن آمفی‌تئاتر پردیس اصفهان'),
      startAt: '2026-06-10T16:00:00.000Z',
      featuredImageMediaId: imgEvent,
    },
    {
      title: fa('کارگاه آموزشی والدین'),
      slug: 'parent-workshop',
      excerpt: fa('متن نمونه معرفی کوتاه برای کارگاه آموزشی ویژه والدین.'),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره سرفصل‌های کارگاه آموزشی والدین و نحوه ثبت‌نام در آن.',
      ),
      category: 'کارگاه آموزشی',
      location: fa('پردیس غرب تهران'),
      startAt: '2026-12-29T17:00:00.000Z',
      featuredImageMediaId: imgEvent,
    },
    {
      title: fa('بازدید علمی از موزه ملی'),
      slug: 'science-museum-visit',
      excerpt: fa(
        'متن نمونه معرفی کوتاه برای بازدید علمی دانش‌آموزان از موزه ملی.',
      ),
      body: fa(
        'متن نمونه توضیح تکمیلی درباره برنامه بازدید علمی، مسیر حرکت و هماهنگی‌های لازم پیش از بازدید.',
      ),
      category: 'بازدید علمی',
      location: fa('پردیس مشهد'),
      startAt: '2027-02-21T08:30:00.000Z',
      featuredImageMediaId: imgEvent,
    },
  ]);

  const galleryItems: Json[] = [
    {
      imageMediaId: galleryImages[0],
      caption: fa('فضای آموزشی شعبه مرکزی'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره فضای آموزشی شعبه مرکزی و امکانات کلاس‌های آن.',
      ),
      category: 'فضای آموزشی',
    },
    {
      imageMediaId: galleryImages[1],
      caption: fa('کارگاه آموزشی ویژه اولیا'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره کارگاه آموزشی برگزارشده ویژه اولیای دانش‌آموزان.',
      ),
      category: 'رویداد',
    },
    {
      imageMediaId: galleryImages[2],
      caption: fa('کلاس درس شعبه غرب تهران'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره فضای کلاس درس و امکانات آموزشی شعبه غرب تهران.',
      ),
      category: 'فضای آموزشی',
    },
    {
      imageMediaId: galleryImages[3],
      caption: fa('نشست معرفی مسیرهای تحصیلی'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره نشست معرفی مسیرهای تحصیلی برای دانش‌آموزان و خانواده‌ها.',
      ),
      category: 'رویداد',
    },
    {
      imageMediaId: galleryImages[4],
      caption: fa('کتابخانه و فضای مطالعه'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره کتابخانه و فضای مطالعه در دسترس دانش‌آموزان.',
      ),
      category: 'فضای آموزشی',
    },
    {
      imageMediaId: galleryImages[5],
      caption: fa('جشن فارغ‌التحصیلی دانش‌آموزان'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره مراسم جشن فارغ‌التحصیلی دانش‌آموزان مجموعه.',
      ),
      category: 'رویداد',
    },
    {
      imageMediaId: galleryImages[6],
      caption: fa('آزمایشگاه علوم شعبه اصفهان'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره آزمایشگاه علوم و تجهیزات آموزشی شعبه اصفهان.',
      ),
      category: 'فضای آموزشی',
    },
    {
      imageMediaId: galleryImages[7],
      caption: fa('مراسم اهدای جوایز برترین‌ها'),
      description: fa(
        'متن نمونه توضیح تکمیلی درباره مراسم اهدای جوایز به دانش‌آموزان برتر مجموعه.',
      ),
      category: 'دستاورد',
    },
  ];
  await seedList('gallery', '/gallery', galleryItems);

  await seedList('achievements', '/achievements', [
    {
      value: '۱۵+',
      label: fa('رتبه‌ی برتر کشوری در المپیادهای علمی دانش‌آموزی'),
    },
    {
      value: '۹۵٪',
      label: fa('قبولی فارغ‌التحصیلان در دانشگاه‌های برتر کشور'),
    },
    {
      value: '۳۰+',
      label: fa('مدال و رتبه در مسابقات علمی و ورزشی استانی و کشوری'),
    },
    { value: '۱۰+', label: fa('تقدیرنامه و جایزه از وزارت آموزش و پرورش') },
  ]);

  await seedList('academic-calendar', '/academic-calendar-entries', [
    {
      kind: 'year_stat',
      value: '۱۵ شهریور ۱۴۰۴',
      title: fa('آغاز سال تحصیلی'),
    },
    {
      kind: 'year_stat',
      value: '۳۱ خرداد ۱۴۰۵',
      title: fa('پایان سال تحصیلی'),
    },
    { kind: 'year_stat', value: '۲', title: fa('تعداد نیم‌سال‌ها') },
    { kind: 'year_stat', value: '۳۷', title: fa('هفته آموزشی') },
    {
      kind: 'term',
      value: '۱',
      title: fa('نیم‌سال اول'),
      dateRange: '۱۵ شهریور تا ۳۰ دی ۱۴۰۴',
      description: fa(
        'متن نمونه درباره محتوای آموزشی، ارزیابی‌های میان‌ترم و فعالیت‌های نیم‌سال اول.',
      ),
    },
    {
      kind: 'term',
      value: '۲',
      title: fa('نیم‌سال دوم'),
      dateRange: '۱ بهمن ۱۴۰۴ تا ۳۱ خرداد ۱۴۰۵',
      description: fa(
        'متن نمونه درباره محتوای آموزشی، ارزیابی‌های میان‌ترم و فعالیت‌های نیم‌سال دوم.',
      ),
    },
    {
      kind: 'holiday',
      title: fa('تعطیلات مهرگان'),
      date: '۱۰ مهر ۱۴۰۴',
      description: fa('متن نمونه درباره تعطیلی یک‌روزه به مناسبت جشن مهرگان.'),
    },
    {
      kind: 'holiday',
      title: fa('شب یلدا'),
      date: '۳۰ آذر ۱۴۰۴',
      description: fa('متن نمونه درباره تعطیلی به مناسبت شب یلدا.'),
    },
    {
      kind: 'holiday',
      title: fa('تعطیلات زمستانه'),
      date: '۲۵ اسفند تا ۱۳ فروردین',
      description: fa('متن نمونه درباره بازه تعطیلات نوروزی و زمستانه.'),
    },
    {
      kind: 'holiday',
      title: fa('سیزده‌به‌در'),
      date: '۱۳ فروردین ۱۴۰۵',
      description: fa('متن نمونه درباره تعطیلی یک‌روزه به مناسبت سیزده‌به‌در.'),
    },
    {
      kind: 'exam_period',
      title: fa('میان‌ترم نیم‌سال اول'),
      dateRange: '۲۰ تا ۲۵ آبان ۱۴۰۴',
      description: fa(
        'متن نمونه درباره برنامه و مواد امتحانی میان‌ترم نیم‌سال اول.',
      ),
    },
    {
      kind: 'exam_period',
      title: fa('امتحانات پایان نیم‌سال اول'),
      dateRange: '۲۰ تا ۳۰ دی ۱۴۰۴',
      description: fa(
        'متن نمونه درباره برنامه و مواد امتحانی پایان نیم‌سال اول.',
      ),
    },
    {
      kind: 'exam_period',
      title: fa('میان‌ترم نیم‌سال دوم'),
      dateRange: '۱۵ تا ۲۰ اسفند ۱۴۰۴',
      description: fa(
        'متن نمونه درباره برنامه و مواد امتحانی میان‌ترم نیم‌سال دوم.',
      ),
    },
    {
      kind: 'exam_period',
      title: fa('امتحانات پایان سال تحصیلی'),
      dateRange: '۱۰ تا ۳۱ خرداد ۱۴۰۵',
      description: fa(
        'متن نمونه درباره برنامه و مواد امتحانی پایان سال تحصیلی.',
      ),
    },
    {
      kind: 'important_date',
      title: fa('آغاز ثبت‌نام سال تحصیلی جدید'),
      date: '۱ مرداد ۱۴۰۴',
      description: fa(
        'متن نمونه درباره بازگشایی ثبت‌نام برای سال تحصیلی جدید.',
      ),
    },
    {
      kind: 'important_date',
      title: fa('جلسه آشنایی با اولیا'),
      date: '۱۰ شهریور ۱۴۰۴',
      description: fa(
        'متن نمونه درباره جلسه معارفه و آشنایی اولیا با کادر آموزشی.',
      ),
    },
    {
      kind: 'important_date',
      title: fa('اولین روز مدرسه'),
      date: '۱۵ شهریور ۱۴۰۴',
      description: fa('متن نمونه درباره آغاز رسمی کلاس‌های سال تحصیلی جدید.'),
    },
    {
      kind: 'important_date',
      title: fa('جلسات اولیا و مربیان'),
      date: 'آخر هر ماه',
      description: fa('متن نمونه درباره برگزاری منظم جلسات اولیا و مربیان.'),
    },
    {
      kind: 'important_date',
      title: fa('جشن پایان سال تحصیلی'),
      date: '۳۱ خرداد ۱۴۰۵',
      description: fa(
        'متن نمونه درباره برگزاری جشن پایان سال تحصیلی و اهدای کارنامه.',
      ),
    },
  ]);

  await seedList('admissions', '/admission-entries', [
    {
      kind: 'step',
      value: '۱',
      title: fa('مشاوره اولیه'),
      description: fa(
        'متن نمونه درباره هماهنگی جلسه مشاوره اولیه با خانواده و دانش‌آموز.',
      ),
    },
    {
      kind: 'step',
      value: '۲',
      title: fa('تکمیل پیش‌ثبت‌نام'),
      description: fa(
        'متن نمونه درباره تکمیل فرم پیش‌ثبت‌نام آنلاین و ارسال اطلاعات اولیه.',
      ),
    },
    {
      kind: 'step',
      value: '۳',
      title: fa('ارزیابی و مصاحبه'),
      description: fa(
        'متن نمونه درباره ارزیابی سطح علمی و مصاحبه حضوری یا آنلاین.',
      ),
    },
    {
      kind: 'step',
      value: '۴',
      title: fa('ارائه مدارک'),
      description: fa(
        'متن نمونه درباره ارائه و بررسی مدارک لازم برای تکمیل پرونده.',
      ),
    },
    {
      kind: 'step',
      value: '۵',
      title: fa('ثبت‌نام قطعی'),
      description: fa(
        'متن نمونه درباره تسویه حساب و تکمیل ثبت‌نام قطعی دانش‌آموز.',
      ),
    },
    {
      kind: 'requirement',
      title: fa('محدوده سنی'),
      description: fa(
        'متن نمونه درباره حداقل و حداکثر سن پذیرش برای هر مقطع تحصیلی.',
      ),
    },
    {
      kind: 'requirement',
      title: fa('سوابق تحصیلی'),
      description: fa(
        'متن نمونه درباره کارنامه و سوابق تحصیلی لازم برای مقاطع بالاتر.',
      ),
    },
    {
      kind: 'requirement',
      title: fa('محدوده جغرافیایی'),
      description: fa(
        'متن نمونه درباره محدوده تحت پوشش هر پردیس برای ثبت‌نام.',
      ),
    },
    {
      kind: 'requirement',
      title: fa('مصاحبه پذیرش'),
      description: fa(
        'متن نمونه درباره الزامی بودن مصاحبه پذیرش برای برخی مقاطع.',
      ),
    },
    {
      kind: 'required_document',
      title: fa('تصویر شناسنامه'),
      description: fa('متن نمونه درباره تصویر کامل صفحات شناسنامه دانش‌آموز.'),
    },
    {
      kind: 'required_document',
      title: fa('تصویر کارت ملی'),
      description: fa(
        'متن نمونه درباره تصویر کارت ملی دانش‌آموز یا سرپرست قانونی.',
      ),
    },
    {
      kind: 'required_document',
      title: fa('کارنامه سال قبل'),
      description: fa(
        'متن نمونه درباره کارنامه تحصیلی آخرین سال تحصیلی گذشته.',
      ),
    },
    {
      kind: 'required_document',
      title: fa('عکس پرسنلی'),
      description: fa('متن نمونه درباره تعداد و قطع مورد نیاز عکس پرسنلی.'),
    },
    {
      kind: 'required_document',
      title: fa('برگه انتقالی'),
      description: fa(
        'متن نمونه درباره برگه انتقالی از مدرسه قبلی، در صورت جابه‌جایی.',
      ),
    },
    {
      kind: 'required_document',
      title: fa('کارت واکسیناسیون'),
      description: fa(
        'متن نمونه درباره کارت واکسیناسیون یا سوابق سلامت دانش‌آموز.',
      ),
    },
    {
      kind: 'tuition_plan',
      title: fa('دوره ابتدایی'),
      price: 'مبلغ نمونه',
      period: 'سالانه',
      includes: ['کتاب و جزوه', 'بیمه حوادث', 'کلاس‌های فوق‌برنامه'],
    },
    {
      kind: 'tuition_plan',
      title: fa('دوره متوسطه اول'),
      price: 'مبلغ نمونه',
      period: 'سالانه',
      includes: ['کتاب و جزوه', 'بیمه حوادث', 'کارگاه‌های تقویتی'],
    },
    {
      kind: 'tuition_plan',
      title: fa('دوره متوسطه دوم'),
      price: 'مبلغ نمونه',
      period: 'سالانه',
      includes: ['کتاب و جزوه', 'بیمه حوادث', 'دوره‌های آمادگی کنکور'],
    },
  ]);

  await seedList('testimonials', '/testimonials', [
    {
      authorName: 'زهرا محمدی',
      authorRole: fa('مادر دانش‌آموز'),
      content: fa(
        'متن نمونه نظر درباره تجربه‌ی خانواده از کیفیت آموزش و ارتباط با مجموعه.',
      ),
      rating: 5,
      avatarMediaId: imgTeacher,
    },
    {
      authorName: 'علی رضایی',
      authorRole: fa('پدر دانش‌آموز'),
      content: fa(
        'متن نمونه نظر درباره رضایت از برنامه‌های آموزشی و پشتیبانی مدرسان.',
      ),
      rating: 5,
      avatarMediaId: imgTeacher,
    },
    {
      authorName: 'مریم کردی',
      authorRole: fa('دانش‌آموز'),
      content: fa(
        'متن نمونه نظر درباره فضای آموزشی و فعالیت‌های فرهنگی مجموعه.',
      ),
      rating: 4,
      avatarMediaId: imgTeacher,
    },
    {
      authorName: 'حسین نوری',
      authorRole: fa('فارغ‌التحصیل'),
      content: fa('متن نمونه نظر درباره نقش مجموعه در موفقیت تحصیلی و کنکور.'),
      rating: 5,
      avatarMediaId: imgTeacher,
    },
  ]);

  // --- navigation (header menu) ---------------------------------------------
  const menus = await existingRows('/menus');
  if (menus.length > 0) {
    console.log('  · navigation: menu already exists — skipped');
    skipped += 1;
  } else {
    const menu = (await api('POST', '/menus', {
      key: 'header',
      name: 'منوی هدر',
    })) as { id: string };
    const navItems: { label: string; url: string }[] = [
      { label: 'خانه', url: '/' },
      { label: 'پردیس‌های آموزشی', url: '/campuses' },
      { label: 'کادر آموزشی', url: '/teachers' },
      { label: 'درباره ما', url: '/about' },
      { label: 'تماس با ما', url: '/contact' },
    ];
    for (const item of navItems) {
      await api('POST', '/menu-items', {
        menuId: menu.id,
        label: fa(item.label),
        linkType: 'external',
        url: item.url,
      });
    }
    console.log(
      `  ✓ navigation: created header menu + ${navItems.length} items`,
    );
    created += 1;
  }

  // --- portal links (no publish lifecycle — created live) --------------------
  await seedList(
    'portal-links',
    '/portal-links',
    [
      {
        label: fa('سامانه آموزش'),
        url: 'https://portal.example.com/education',
      },
      { label: fa('سامانه مالی'), url: 'https://portal.example.com/finance' },
    ],
    false,
  );

  // --- singletons (PATCH in place) ------------------------------------------
  console.log('\nSingletons:');
  await api('PATCH', '/about', {
    title: fa('با گروه آموزشی ما بیشتر آشنا شوید'),
    body: fa(
      'گروه آموزشی ندای حقیقت با هدف ارتقای کیفیت آموزش و پرورش نسل آینده فعالیت می‌کند. در این مسیر، از اساتید مجرب، متدهای آموزشی روز و امکانات آموزشی متنوع بهره می‌بریم تا هر دانش‌آموز مسیر رشد خود را پیدا کند.',
    ),
    imageMediaId: imgAbout,
  });
  await publishSingleton('/about');
  console.log('  ✓ about updated + published');

  await api('PATCH', '/cta', {
    title: fa('به خانواده‌ی ما بپیوندید'),
    description: fa(
      'برای آشنایی بیشتر با مجموعه و آغاز مسیر ثبت‌نام، همین حالا با ما در تماس باشید.',
    ),
    primaryButtonLabel: fa('شروع پیش‌ثبت‌نام'),
    primaryButtonUrl: '/pre-registration',
    secondaryButtonLabel: fa('پذیرش و ثبت‌نام'),
    secondaryButtonUrl: '/admissions',
  });
  await publishSingleton('/cta');
  console.log('  ✓ cta updated + published');

  await api('PATCH', '/site-settings/general', {
    siteName: fa('گروه آموزشی ندای حقیقت'),
    tagline: fa('آموزش با کیفیت، آینده‌ای روشن'),
    logoMediaId: imgLogo,
  });
  await api('PATCH', '/site-settings/contact', {
    contactEmail: 'info@nedaye-haghighat.ir',
    contactPhone: '۰۲۱-۱۲۳۴۵۶۷۸',
    address: fa('تهران، خیابان انقلاب، نرسیده به میدان فردوسی، پلاک ۱۲'),
    mapUrl: 'https://maps.google.com/?q=35.7000,51.4200',
  });
  await api('PATCH', '/site-settings/social', {
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/example' },
      { platform: 'telegram', url: 'https://t.me/example' },
      { platform: 'whatsapp', url: 'https://wa.me/989120000000' },
    ],
  });
  console.log('  ✓ site-settings updated (general, contact, social)');

  console.log(
    `\nDone. ${created} created, ${skipped} skipped (already populated).`,
  );
}

seed().catch((err) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
