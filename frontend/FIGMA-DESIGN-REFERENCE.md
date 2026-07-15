# Figma Design Reference — Website Management System (Homepage)

سند مرجع کامل طراحی فیگما (`Premium_Educational_Group_Website.zip`) که در سشن‌های بعدی به‌عنوان
تنها منبع حقیقت (source of truth) بصری استفاده بشه — بدون نیاز به دوباره آپلود/استخراج فایل فیگما.

> **پروژه:** Website Management System (ماژول NestJS جدا از TuitionSchool، معماری مستقل).
> **دامنه‌ی این سند:** فقط فرانت — Homepage تک‌صفحه‌ای که در فیگما export شده (`src/app/App.tsx`، ۱۰۶۶ خط، یک فایل).
> **مسیر معادل در پروژه‌ی واقعی:** `frontend/frontend/` (React + Vite + TS + Tailwind + Clean-ish architecture، feature modules).

---

## ۱. Design Tokens — ✅ اعمال‌شده

این بخش قبلاً پیاده‌سازی شده (فایل `src/shared/design-system/tokens/tokens.css`). فقط برای مرجع نگه داشته شده:

| Token | مقدار Hex (فیگما) | HSL اعمال‌شده |
|---|---|---|
| `--primary` / `--brand-navy` | `#0F2D52` | `213 69% 19%` |
| `--accent` / `--brand-gold` | `#C9A227` | `46 68% 47%` (solid gold، نه نسخه‌ی روشن) |
| `--background` | `#ffffff` | `0 0% 100%` |
| `--foreground` | `#1A2235` | `222 34% 15%` |
| `--card` | `#F7F9FC` | `216 45% 98%` |
| `--secondary` / `--muted` | `#EEF2F8` | `216 42% 95%` |
| `--muted-foreground` | `#6B7285` | `224 11% 47%` |
| `--destructive` | `#d4183d` | `348 80% 46%` |
| `--border` | `rgba(15,45,82,0.1)` | `213 69% 19% / 0.1` |
| `--radius` | — | `1rem` (بود `0.5rem`) |
| فونت | — | `Vazirmatn` (بود `Inter`؛ اسکلت `@font-face` در `assets/styles/fonts.css` منتظر فایل‌های واقعی `.woff2`) |

**تصمیم گرفته‌شده:** رنگ‌های دارک‌مود (`.dark` در `tokens.css`) دست نخورده — طبق کامنت خودِ فایل «scaffolding غیرفعال، نه یک تم رسمی».

---

## ۲. وابستگی‌ها (Dependencies)

| پکیج فیگما | تصمیم | دلیل |
|---|---|---|
| `lucide-react` | ✅ اضافه شد به `package.json` | از قبل در کامنت `icon-button.tsx` به‌عنوان کتابخونه‌ی موردانتظار پروژه ذکر شده بود؛ سبک و tree-shakeable |
| `motion` (framer-motion) | ❌ اضافه نشد | به‌جاش از `tailwindcss-animate` (که از قبل دیپندنسی پروژه‌ست) با کلاس‌های `animate-in fade-in slide-in-from-*` استفاده می‌کنیم — انیمیشن CSS-only بدون وابستگی جدید |
| shadcn/ui components (`ui/*`) | استفاده نشد مستقیم | پروژه‌ی واقعی primitiveهای خودش رو در `shared/design-system/components` داره (Button, Link, Card, Section, Container, Stack, ...) که معادل‌های shadcn هستن؛ هر بخش figma باید با این primitiveها بازسازی بشه، نه کپی مستقیم فایل‌های `ui/*.tsx` فیگما |
| عکس‌ها | Unsplash (placeholder در فیگما هم همینه) | محتوای واقعی قراره از ماژول CRM/content management بیاد (طبق نظر کاربر) — فعلاً همون الگوی placeholder ادامه پیدا می‌کنه |

---

## ۳. ساختار کلی صفحه (App.tsx ترتیب رندر)

```
<TopBar />
<Navbar />              ← sticky, scroll-aware style
<PortalModal />         ← مودال سراسری، با state جدا کنترل می‌شه
<main>
  <HeroSection />
  <StatsSection />
  <AboutSection />
  <CampusesSection />
  <WhyChooseSection />
  <AchievementsSection />
  <NewsSection />
  <GallerySection />
  <CTASection />
</main>
<Footer />
```

**نکته‌ی معماری مهم:** بخش‌های `bg-primary` تمام‌عرض (Hero، Stats، Achievements، CTA) و `Footer`
همه full-bleed هستن (بیرون از `max-w-7xl` container اصلی خودشون رو باز می‌کنن). توی پروژه‌ی واقعی
این یعنی این section‌ها باید مثل `Hero` (که الان انجام شده) **بیرون از `PageLayout`** در `HomePage.tsx`
رندر بشن، نه داخلش. `TopBar`/`Navbar`/`Footer` هم به‌طور طبیعی بیرون از `PageLayout`ان چون توی
`AppShell`/`shell/` زندگی می‌کنن نه توی صفحه.

---

## ۴. Section به Section

برای هر بخش: هدف، محتوای متنی (انگلیسیِ فیگما — باید به کپی‌رایتینگ فارسی placeholder تبدیل بشه
طبق کانوانسیون موجود پروژه)، آیکون‌ها، ساختار layout، و معادل feature module در پروژه‌ی واقعی.

### 4.1 TopBar — ✅ پیاده شده (`app/shell/TopBar.tsx`)
- نوار باریک بالای صفحه، `bg-primary`, متن `text-white/70 text-xs`.
- چپ: تلفن (`tel:`)، ایمیل (`mailto:`، فقط `md+`)، آدرس کوتاه (فقط `lg+`، بدون لینک).
- راست: آیکون‌های شبکه‌ی اجتماعی (Instagram، Telegram/`Send`، Aparat/`Play`) — همه `href="#"` در فیگما.
- آیکون‌ها: `Phone`, `Mail`, `MapPin`, `Instagram`, `Send`, `Play` (از `lucide-react`).
- **معادل واقعی:** بخشی از `app/shell/` (کنار `Header.tsx`). دیتای تماس/شبکه‌اجتماعی نهایتاً از Site
  Settings میاد؛ فعلاً placeholder.

### 4.2 Navbar — ✅ پیاده شده (`Header.tsx` بازطراحی شد + دکمه‌ی «ورود به پورتال»، `MobileNavigation.tsx` به drawer واقعی از چپ تبدیل شد)
- Sticky، `scrolled` state تغییر ظاهر می‌ده (شفاف‌تر ↔ `bg-white/95 backdrop-blur-md shadow-sm`).
- لوگو: مربع navy با حروف "NH" به رنگ gold + نام کامل مجموعه (دو خط، فارسی می‌شه).
- لینک‌های ناوبری دسکتاپ: `Home, Schools, About, News, Pre-registration, Contact`.
- دکمه‌ی «Portal Login» سمت راست (فقط `sm+`)، دور navy با رنگ روی hover → gold.
- همبرگر منو در `lg` به پایین‌تر → **drawer** از راست (چون RTL باید از **چپ** باز بشه در نسخه‌ی فارسی؛
  این یه نکته‌ی حیاتیه که موقع پیاده‌سازی باید معکوس بشه): لوگو بالا، لیست لینک‌ها، دکمه‌ی Portal Login پایین.
- آیکون‌ها: `Menu`, `X`, `ChevronRight`, `ArrowRight`.
- **مسیر لینک‌ها → روت واقعی پروژه:**

| لینک فیگما (EN) | روت واقعی |
|---|---|
| Home | `/` |
| Schools | `/schools` |
| About | `/about` |
| News | `/news` |
| Pre-registration | `/pre-registration` |
| Contact | `/contact` |

  (روت `/campuses`, `/teachers`, `/events`, `/admissions`, `/academic-calendar`, `/gallery`, `/statistics`, `/site`
  هم وجود دارن ولی توی nav اصلی فیگما نیستن — احتمالاً فوتر یا زیرمنو.)

- **دکمه‌ی «Portal Login»:** در پروژه‌ی واقعی هیچ روت پرتال/لاگینی فعلاً تعریف نشده. **این یه تصمیم بازه**
  که باید قبل از پیاده‌سازی Navbar گرفته بشه — چون مودالِ زیر (`PortalModal`) کاملاً به این دکمه وابسته‌ست.

### 4.3 PortalModal — ✅ پیاده شده (`app/shell/PortalModal.tsx`) — تصمیم محصولی گرفته شد: لینک بیرونی به دامنه‌ی TuitionSchool (`PORTAL_ROLE_BASE_URL` — دامنه‌ی واقعی هنوز مشخص نشده، placeholder صریح تا اون موقع)
- مودال انتخاب پرتال با ۴ کارت: **Parent Portal**، **Teacher Portal**، **School Staff Portal**،
  **Administration Portal** — هرکدوم با آیکون (`Users`, `GraduationCap`, `Building2`, `ShieldCheck`)،
  رنگ badge جدا، توضیح کوتاه، و تگ («For Families» و غیره).
- زیرش لینک «Access issues? Contact IT Support».
- ⚠️ **این دقیقاً روی مرز دو پروژه‌ست:** پورتال معلم/والدین/ادمین همون نقش‌هایی هستن که در
  **TuitionSchool** (پروژه‌ی جدا) پیاده‌سازی می‌شن. باید مشخص بشه این مودال صرفاً یه **لینک بیرونی**
  به دامنه/ساب‌دامنه‌ی TuitionSchool میزنه (که با معماری «Website ماژول مستقل از Tuition» سازگارتره)
  یا قراره چیز دیگه‌ای باشه. **قبل از پیاده‌سازی این بخش حتماً بپرس.**

### 4.4 HeroSection — ✅ پیاده شده (`features/hero/Hero.tsx`)
- Full-bleed، `h-[90vh] min-h-[600px]`، عکس پس‌زمینه + سه لایه گرادیان navy روش.
- Eyebrow (خط طلایی + نام مجموعه) → H1 دو رنگ (سفید + کلمه‌ی gold) → پاراگراف توضیح → دو CTA pill
  (اصلی gold، ثانویه outline سفید) → scroll cue پایین صفحه.
- در فیگما CTA دوم «Portal Login» بود؛ چون روت پرتال نداریم، با «تماس با ما» (`/contact`) جایگزین شد.
- آیکون: `ArrowRight` (در نسخه‌ی RTL شده: `ArrowLeft` چون جهت پیکان باید معکوس بشه).

### 4.5 StatsSection — ✅ پیاده شده (`features/statistics/HomeStatsBand.tsx`)
- نوار `bg-primary` تمام‌عرض، ۴ ستون (`grid-cols-2 md:grid-cols-4`)، خطوط جداکننده‌ی نازک بین ستون‌ها (`gap-px bg-white/8`).
- هر آیتم: عدد بزرگ gold با انیمیشن **count-up** (هوک `useCountUp` — `IntersectionObserver` که وقتی
  آیتم وارد viewport شد، شمارش با `requestAnimationFrame` و easing کوبیک شروع می‌شه) + suffix (`+`) + لیبل ریز سفید‌کم‌رنگ.
- محتوا: `4+ Campuses`, `3500+ Students`, `220+ Staff Members`, `20+ Years of Excellence`.
- **نکته‌ی پیاده‌سازی:** هوک `useCountUp` وابستگی خارجی نداره (فقط React hooks خام) — می‌شه عیناً به یه
  `shared/hooks/useCountUp.ts` منتقلش کرد.

### 4.6 AboutSection — ✅ پیاده شده (`features/about/HomeAbout.tsx`)
- دو ستونه (`lg:grid-cols-2`): عکس (نسبت `4/5`، rounded، با دو مربع دکوری پشتش + یه کارت شناور «20+ Years
  Shaping Young Minds» گوشه‌ی پایین) | متن (eyebrow «Our Story» → H2 دو خطی → دو پاراگراف → ۳ آیتم چک‌لیست
  با بولت gold → دکمه‌ی «Our Mission & Vision»).
- انیمیشن ورود: `motion.div` با `initial x:∓30 → whileInView x:0` (اسلاید از دو طرف مخالف).
  **معادل بدون motion:** `animate-in slide-in-from-start-8`/`slide-in-from-end-8` با `IntersectionObserver`
  دستی یا صرفاً بدون scroll-trigger (فقط ورود اولیه‌ی صفحه) چون تشخیص «وارد viewport شد» بدون کتابخونه
  نیاز به کد دستی داره — باید تصمیم گرفته بشه چقدر وفاداری به افکت اسکرول لازمه.

### 4.7 CampusesSection — ✅ پیاده شده (`features/campuses/HomeCampuses.tsx`)
- عنوان مرکزی (eyebrow «Our Schools» → H2 «Our Campuses» → توضیح) + گرید کارت (`md:grid-cols-2 lg:grid-cols-4`).
- هر `CampusCard`: عکس (`h-56`, badge رنگی گوشه‌ی بالا-چپ مثل «Primary · Boys») → آدرس کوتاه با آیکون
  `MapPin` → نام مدرسه → مقطع (`Grades 1–6`) → لینک «View School» با آیکون `ArrowRight` که روی hover جابه‌جا می‌شه.
- کارت آخر همیشه یه placeholder «Coming Soon / Future Campus» با border نقطه‌چین.
- داده‌ی نمونه (۳ کمپوس) — باید طبق داده‌ی واقعی خودتون (نه این اسامی فرضی) جایگزین بشه، این‌ها فقط
  الگوی ساختاری دیتان: `{ name, fullName, location, badge, image, badgeBg, badgeText, grades }`.

### 4.8 WhyChooseSection — ✅ پیاده شده (`features/features/Features.tsx`)
- عنوان مرکزی («Why Choose Us» → «Built for Excellence») + گرید ۶تایی آیکون (`grid-cols-2 md:grid-cols-3`).
- هر آیتم: باکس آیکون (hover رنگش از navy به gold عوض می‌شه) → عنوان → توضیح کوتاه.
- آیکون‌ها: `Monitor` (کلاس هوشمند)، `FlaskConical` (آزمایشگاه)، `BookOpen` (کتابخانه)، `Dumbbell`
  (ورزش)، `Globe` (زبان)، `Music` (فرهنگی‌هنری).
- این دقیقاً معادل موضوعیِ `features/features` فعلی پروژه‌ست — پیاده‌سازی این بخش یعنی بازطراحی همون
  feature، نه ساخت جدید.

### 4.9 AchievementsSection — ✅ پیاده شده (`features/achievements/HomeAchievements.tsx`)
- Full-bleed `bg-primary` با تکسچر نقطه‌ای ظریف پس‌زمینه (`radial-gradient` نقطه‌چین، اپاسیتی ۰.۰۳).
- دو ستونه: چپ (eyebrow «Achievements» → H2 «A Legacy of Academic Excellence» → پاراگراف → کارت
  Trophy با «۲۰+ سال») | راست (لیست عمودی ۴ افتخار، هرکدوم عدد گنده gold + جداکننده‌ی عمودی + توضیح).
- آیکون: `Trophy`.
- محتوای نمونه: رتبه‌ی المپیاد، درصد قبولی دانشگاه، مدال مسابقات، جوایز وزارت آموزش — باید با آمار
  واقعی خودتون جایگزین بشه.

### 4.10 NewsSection — ✅ پیاده شده (`features/news/HomeNews.tsx`)
- هدر flex (عنوان سمت شروع، لینک «View All News» سمت پایان) + گرید ۳ کارت خبر.
- هر کارت: عکس (`h-48`) → بج دسته‌بندی (gold) + تاریخ (آیکون `Calendar`) → تیتر (`line-clamp-2`) →
  خلاصه (`line-clamp-3`) → لینک «Read More».
- آیکون: `Calendar`, `ArrowRight`.

### 4.11 GallerySection — ✅ پیاده شده (`features/gallery/HomeGallery.tsx`)
- گرید masonry-مانند (`grid-cols-2 md:grid-cols-3`, `gridAutoRows: 200px`, بعضی آیتم‌ها `row-span-2` برای تنوع ارتفاع).
- هر عکس: overlay navy که فقط روی hover ظاهر می‌شه (`bg-primary/0 → group-hover:bg-primary/20`).
- بدون متن روی عکس‌ها — فقط `alt` توصیفی برای دسترسی‌پذیری.

### 4.12 CTASection — ✅ پیاده شده (`features/cta/CTA.tsx`)
- Full-bleed `bg-primary` با همون تکسچر نقطه‌ای (اپاسیتی ۰.۰۴)، محتوای وسط‌چین.
- eyebrow «Join Our Family» → H2 بزرگ (`text-5xl` در دسکتاپ) → پاراگراف → دو دکمه‌ی pill
  (اصلی gold «Start Pre-registration»، ثانویه outline سفید «Schedule a Campus Visit»).
- ساختاری تقریباً یکسان با `HeroSection` (همون رنگ/تکسچر/pill buttons) ولی بدون عکس پس‌زمینه —
  یعنی بعد از پیاده‌سازی Hero، این بخش کار کمی داره چون خیلی از الگوها تکرار میشه.

### 4.13 Footer — ✅ پیاده شده (`app/shell/Footer.tsx` بازطراحی شد — ۴ ستون طبق فیگما، توکن `--footer-bg` اضافه شد)
- پس‌زمینه‌ی navy تیره‌تر از primary توکن (`#0A1E38` هاردکد در فیگما — **این با هیچ توکن فعلی یکی
  نیست**؛ باید تصمیم بگیریم یه توکن جدید `--footer-bg` اضافه کنیم یا از `--primary` با opacity/darken استفاده کنیم).
- ۴ ستون (`lg:grid-cols-4`): برند+توضیح+شبکه‌اجتماعی | لینک‌های سریع | لیست مدارس | اطلاعات تماس
  (آدرس با `MapPin`، تلفن با `Phone` (`tel:`)، ایمیل با `Mail` (`mailto:`)).
- خط پایین: کپی‌رایت + لینک‌های Privacy/Terms/Sitemap (هرسه `href="#"` در فیگما — این‌ها باید یا روت
  واقعی بگیرن یا حذف بشن، طبق قاعده‌ی «no placeholder code»).

---

## ۵. تصمیم‌های باز — همه حل شدن ✅

1. **Portal Login / PortalModal** → ✅ حل شد: مودال با ۴ کارت پورتال، هرکدوم لینک بیرونی به دامنه‌ی
   TuitionSchool می‌زنه (`PortalModal.tsx`، `PORTAL_ROLE_BASE_URL`). دامنه‌ی واقعی TuitionSchool هنوز
   مشخص نیست، پس این مقدار یه placeholder صریح و مستندشده‌ست، نه یه `href="#"`.
2. **جهت drawer موبایل Navbar** → ✅ حل شد: از **چپ** باز می‌شه (`MobileNavigation.tsx`،
   `inset-y-0 end-0` + `slide-in-from-end`، منطق CSS logical property به‌جای هاردکد چپ/راست).
3. **رنگ فوتر `#0A1E38`** → ✅ حل شد: توکن جدید `--footer-bg` تعریف شد (`tokens.css` +
   `tailwind.config.js`، کلاس `bg-footer`).
4. **وفاداری به انیمیشن‌های scroll-triggered** (`whileInView`) → ✅ حل‌شده در پیاده‌سازی About:
   گزینه‌ی ساده‌تر — فقط `animate-in slide-in-from-start/end-8` روی mount اولیه (بدون
   `IntersectionObserver`)، دقیقاً هم‌راستا با الگویی که `Hero` قبلاً استفاده کرده.
5. **دیتای نمونه‌ی هر بخش** (کمپوس‌ها، اخبار، افتخارات، آمار، گالری) → همه از فیگما «فرضی» هستن؛ باید
   با محتوای واقعی/عکس واقعی‌ای که قراره از ماژول CRM بیاد جایگزین بشن — فعلاً همون فرمت ساختاری حفظ
   می‌شه.
6. **لینک‌های `href="#"`** → ✅ حل شد: شبکه‌اجتماعی TopBar/Footer و ردیف Privacy/Terms/Sitemap فوتر
   کلاً از پیاده‌سازی حذف شدن (طبق قاعده‌ی «no placeholder code») تا وقتی روت/URL واقعی داشته باشیم.

---

## ۶. ترتیب پیشنهادی پیاده‌سازی (بر اساس تصمیم‌های قبلی: محتوای اصلی → shell بعداً)

```
✅ Hero            (انجام شد)
✅ Stats           (انجام شد — HomeStatsBand)
✅ CTA              (انجام شد)
✅ WhyChoose        (انجام شد — بازطراحی features/features، گرید ۶ آیکونی)
✅ About            (انجام شد — features/about/HomeAbout.tsx، بدون scroll-trigger، مثل Hero)
✅ Campuses         (انجام شد — features/campuses/HomeCampuses.tsx، دیتای محلی جدا از campuses/data.ts)
✅ Achievements     (انجام شد — features/achievements/HomeAchievements.tsx، فیچر جدید طبق features/README.md)
✅ News             (انجام شد — features/news/HomeNews.tsx، از newsItems واقعی استفاده می‌کنه)
✅ Gallery          (انجام شد — features/gallery/HomeGallery.tsx، ماسونری بدون تصویر واقعی)
✅ TopBar           (انجام شد — app/shell/TopBar.tsx)
✅ Navbar           (انجام شد — Header.tsx + MobileNavigation.tsx drawer از چپ)
✅ PortalModal      (انجام شد — app/shell/PortalModal.tsx)
✅ Footer           (انجام شد — app/shell/Footer.tsx، ۴ ستون + توکن --footer-bg)
```

همه‌ی بخش‌های چک‌لیست پیاده‌سازی شدن. مورد باز باقی‌مونده صرفاً دیتای نمونه (بخش ۵.۵) و دامنه‌ی واقعی
TuitionSchool برای `PortalModal` (بخش ۵.۱) هستن — هردو منتظر محتوای واقعی از بک‌اند/CRM، نه کار فرانت.
