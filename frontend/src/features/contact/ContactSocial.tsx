import { ArrowUpLeft } from "lucide-react";
import { useSiteSettings } from "@/features/site";
import type { SiteSettingsSocialPlatform } from "@/features/site";

const SOCIAL_CHANNELS: Record<
  SiteSettingsSocialPlatform,
  { label: string; description: string }
> = {
  instagram: {
    label: "اینستاگرام",
    description: "خبرها و لحظه‌های آموزشی گروه را دنبال کن.",
  },
  telegram: {
    label: "تلگرام",
    description: "برای دریافت اطلاعیه‌ها و مطالب آموزشی همراه ما باش.",
  },
  whatsapp: {
    label: "واتس‌اپ",
    description: "از تازه‌ترین خبرهای آموزشی گروه باخبر شو.",
  },
  eitaa: {
    label: "ایتا",
    description: "اطلاعیه‌ها و محتوای آموزشی را در کانال گروه ببین.",
  },
  bale: { label: "بله", description: "پیام‌ها و خبرهای آموزشی گروه را دنبال کن." },
  rubika: { label: "روبیکا", description: "از برنامه‌ها و فعالیت‌های گروه باخبر شو." },
  aparat: { label: "آپارات", description: "ویدیوها و محتوای آموزشی گروه را تماشا کن." },
  youtube: { label: "یوتیوب", description: "ویدیوها و آموزش‌های گروه را دنبال کن." },
  linkedin: { label: "لینکدین", description: "فعالیت‌ها و خبرهای حرفه‌ای گروه را ببین." },
  twitter: { label: "توییتر", description: "خبرها و نکته‌های کوتاه آموزشی را دنبال کن." },
  facebook: { label: "فیسبوک", description: "از فعالیت‌ها و خبرهای گروه باخبر شو." },
};

export function ContactSocial() {
  const { data } = useSiteSettings();
  const socialLinks = data?.socialLinks.filter((social) => social.active !== false) ?? [];

  if (socialLinks.length === 0) return null;

  return (
    <section aria-labelledby="contact-social-heading" className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-sm font-medium text-sky-300">همراه ما باش</p>
        <h2
          id="contact-social-heading"
          className="font-heading text-2xl font-bold text-white sm:text-3xl"
        >
          یادگیری، فراتر از کلاس
        </h2>
        <p className="mt-4 leading-7 text-slate-300">
          برای آشنایی با دوره‌های جدید، دریافت نکته‌های آموزشی و دنبال‌کردن فعالیت‌های
          گروه، همراه ما باش.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {socialLinks.map((social) => {
          const channel = SOCIAL_CHANNELS[social.platform];
          return (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-32 items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/30 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <span>
                <span className="block font-semibold text-white">{channel.label}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-300">
                  {channel.description}
                </span>
              </span>
              <ArrowUpLeft
                aria-hidden="true"
                size={18}
                className="shrink-0 text-sky-300 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}
