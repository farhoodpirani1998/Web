import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Phone, Mail, MapPin, Menu, X, ArrowRight, ChevronRight,
  Users, GraduationCap, Building2, ShieldCheck,
  Monitor, FlaskConical, BookOpen, Dumbbell, Globe, Music,
  Trophy, Calendar, Play, Instagram, Send
} from "lucide-react";

// ─── Count-up hook ───────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="bg-primary text-white/70 text-xs py-2.5 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-5">
          <a href="tel:+982634567890" className="flex items-center gap-1.5 hover:text-accent transition-colors duration-200">
            <Phone size={11} strokeWidth={1.5} />
            <span className="hidden sm:inline">+98 26 3456 7890</span>
          </a>
          <a href="mailto:info@nedayehaghighat.ir" className="hidden md:flex items-center gap-1.5 hover:text-accent transition-colors duration-200">
            <Mail size={11} strokeWidth={1.5} />
            <span>info@nedayehaghighat.ir</span>
          </a>
          <div className="hidden lg:flex items-center gap-1.5 text-white/40">
            <MapPin size={11} strokeWidth={1.5} />
            <span>Karaj, Alborz Province, Iran</span>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <a href="#" aria-label="Instagram" className="hover:text-accent transition-colors duration-200">
            <Instagram size={13} strokeWidth={1.5} />
          </a>
          <a href="#" aria-label="Telegram" className="hover:text-accent transition-colors duration-200">
            <Send size={13} strokeWidth={1.5} />
          </a>
          <a href="#" aria-label="Aparat" className="hover:text-accent transition-colors duration-200">
            <Play size={13} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
const navLinks = ["Home", "Schools", "About", "News", "Pre-registration", "Contact"];

function Navbar({
  onPortalOpen,
  scrolled,
  mobileOpen,
  setMobileOpen,
}: {
  onPortalOpen: () => void;
  scrolled: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-white border-b border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-accent font-black text-sm tracking-tight leading-none">NH</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-primary font-bold text-sm">Nedaye Haghighat</div>
              <div className="text-muted-foreground text-[10px] font-medium tracking-wide">Educational Group</div>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="px-3.5 py-2 text-sm text-foreground/65 hover:text-primary font-medium transition-colors duration-200 rounded-lg hover:bg-muted"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          {/* Portal Login + Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPortalOpen}
              className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-semibold border-2 border-primary/20 text-primary rounded-full hover:border-accent hover:text-accent transition-all duration-200 hover:shadow-sm"
            >
              Portal Login
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-primary rounded-xl hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-accent font-black text-xs">NH</span>
              </div>
              <span className="text-primary font-bold text-sm">Nedaye Haghighat</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-1.5 text-foreground/50 hover:text-primary rounded-lg transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
            {navLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-3 px-3 text-sm text-foreground/80 hover:text-primary hover:bg-muted rounded-xl transition-colors"
                >
                  {link}
                  <ChevronRight size={13} className="text-foreground/30" />
                </a>
              </li>
            ))}
          </ul>
          <div className="p-5 border-t border-border">
            <button
              onClick={() => { setMobileOpen(false); onPortalOpen(); }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-200"
            >
              Portal Login
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Portal Selector Modal ────────────────────────────────────────────────────
const portals = [
  {
    id: "parent",
    icon: Users,
    title: "Parent Portal",
    description: "Track academic progress, attendance, schedules, and communicate with teachers.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    tag: "For Families",
  },
  {
    id: "teacher",
    icon: GraduationCap,
    title: "Teacher Portal",
    description: "Access student records, grade management, lesson plans, and resources.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tag: "For Educators",
  },
  {
    id: "staff",
    icon: Building2,
    title: "School Staff Portal",
    description: "Staff scheduling, HR tools, internal communications, and campus operations.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    tag: "For Staff",
  },
  {
    id: "admin",
    icon: ShieldCheck,
    title: "Administration Portal",
    description: "Group-wide analytics, strategic oversight, and administrative management.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    tag: "For Leadership",
  },
];

function PortalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Portal Selector"
    >
      <div className="absolute inset-0 bg-primary/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transition-all duration-300 overflow-hidden ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 md:p-8 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-4 bg-accent rounded-full" />
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Nedaye Haghighat</span>
            </div>
            <h2 className="text-primary text-xl font-bold">Choose Your Portal</h2>
            <p className="text-muted-foreground text-sm mt-1">Select the portal that matches your role to continue.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground/40 hover:text-primary rounded-xl hover:bg-muted transition-colors -mt-1 -mr-2 flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 md:p-8 pt-5">
          {portals.map(({ id, icon: Icon, title, description, iconBg, iconColor, tag }) => (
            <button
              key={id}
              className="group text-left p-5 rounded-xl border-2 border-border hover:border-accent hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full">{tag}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-primary font-bold text-sm mb-1">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-foreground/20 group-hover:text-accent transition-colors mt-0.5 flex-shrink-0"
                />
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 md:px-8 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            Access issues?{" "}
            <a href="#" className="text-accent font-semibold hover:underline">Contact IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ onPortalOpen }: { onPortalOpen: () => void }) {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden flex items-center bg-primary">
      <img
        src="https://images.unsplash.com/photo-1762846993248-7d8f6b8d3582?w=1920&h=1080&fit=crop&auto=format"
        alt="Nedaye Haghighat Educational Group campus building"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-primary/78" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full pt-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-7"
          >
            <div className="h-px w-10 bg-accent" />
            <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">
              Nedaye Haghighat Educational Group
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white text-4xl md:text-5xl lg:text-[3.75rem] font-bold leading-[1.15] mb-6 tracking-tight"
          >
            A Bright Future Through{" "}
            <span className="text-accent">Meaningful</span>{" "}
            Education
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-white/65 text-base md:text-lg max-w-xl mb-10 leading-relaxed font-light"
          >
            Shaping generations through modern pedagogy, values-centered learning, and world-class educational environments across Alborz Province.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-primary font-bold text-sm rounded-full hover:bg-[#b8921f] transition-colors duration-200 shadow-lg shadow-accent/20"
            >
              Pre-registration
              <ArrowRight size={15} />
            </a>
            <button
              onClick={onPortalOpen}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white text-sm font-medium rounded-full hover:border-accent hover:text-accent transition-all duration-200 backdrop-blur-sm"
            >
              Portal Login
              <ArrowRight size={15} />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/30 text-[10px] tracking-[0.25em] uppercase font-medium">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="bg-primary text-center py-10 px-6">
      <div className="text-accent text-4xl md:text-5xl font-bold mb-2 tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/40 text-[11px] font-semibold tracking-widest uppercase">{label}</div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8">
        <StatItem value={4} suffix="+" label="Campuses" />
        <StatItem value={3500} suffix="+" label="Students" />
        <StatItem value={220} suffix="+" label="Staff Members" />
        <StatItem value={20} suffix="+" label="Years of Excellence" />
      </div>
    </section>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          {/* Image column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-muted shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=1000&fit=crop&auto=format"
                alt="Students learning at Nedaye Haghighat"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-5 -right-5 w-36 h-36 border-2 border-accent/25 rounded-2xl -z-10" />
            <div className="absolute -top-5 -left-5 w-24 h-24 bg-accent/8 rounded-2xl -z-10" />
            {/* Floating stat */}
            <div className="absolute bottom-7 -right-2 md:-right-7 bg-white rounded-2xl shadow-xl p-4 border border-border">
              <div className="text-accent text-3xl font-bold leading-none">20+</div>
              <div className="text-primary text-xs font-semibold mt-1 max-w-[120px] leading-tight">Years Shaping Young Minds</div>
            </div>
          </motion.div>

          {/* Content column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Our Story</span>
            </div>
            <h2 className="text-primary text-3xl md:text-[2.5rem] font-bold leading-tight mb-6 tracking-tight">
              A Philosophy Rooted in<br />Excellence and Values
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5 text-[0.95rem]">
              Founded over two decades ago, Nedaye Haghighat Educational Group was born from a vision to redefine what education means for families in Alborz Province. We believe that meaningful education encompasses intellectual growth, moral character, and creative potential in equal measure.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-9 text-[0.95rem]">
              Today, our network of campuses serves thousands of students across multiple educational stages, each environment purposefully designed to help students discover their unique strengths and build the foundations of their future.
            </p>
            <div className="flex flex-col gap-3.5 mb-9">
              {[
                "Values-centered curriculum aligned with international standards",
                "Dedicated educators trained in progressive modern pedagogy",
                "State-of-the-art facilities designed for 21st-century learning",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <span className="text-foreground/75 text-sm leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors duration-200 shadow-md"
            >
              Our Mission & Vision
              <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Campuses ────────────────────────────────────────────────────────────────
const campuses = [
  {
    name: "Boys Primary School",
    fullName: "Nedaye Haghighat Boys Primary School",
    location: "Karaj, Golshahr District",
    badge: "Primary · Boys",
    image: "https://images.unsplash.com/photo-1614595737766-4d7e1fd1406f?w=800&h=600&fit=crop&auto=format",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    grades: "Grades 1 – 6",
  },
  {
    name: "Girls Primary School",
    fullName: "Nedaye Haghighat Girls Primary School",
    location: "Karaj, Golshahr District",
    badge: "Primary · Girls",
    image: "https://images.unsplash.com/photo-1771911651263-0557330c886a?w=800&h=600&fit=crop&auto=format",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    grades: "Grades 1 – 6",
  },
  {
    name: "Girls Middle School",
    fullName: "Nedaye Haghighat Girls Middle School",
    location: "Karaj, Mehrdad District",
    badge: "Middle School · Girls",
    image: "https://images.unsplash.com/photo-1771909712463-b1c7b542f845?w=800&h=600&fit=crop&auto=format",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    grades: "Grades 7 – 9",
  },
];

function CampusCard({ campus, index }: { campus: (typeof campuses)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="relative overflow-hidden h-56 bg-muted">
        <img
          src={campus.image}
          alt={campus.fullName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
        <span className={`absolute top-4 left-4 text-[11px] font-bold px-3 py-1.5 rounded-full ${campus.badgeBg} ${campus.badgeText}`}>
          {campus.badge}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
          <MapPin size={11} strokeWidth={1.5} />
          {campus.location}
        </div>
        <h3 className="text-primary font-bold text-lg leading-tight mb-1">{campus.name}</h3>
        <p className="text-muted-foreground text-sm mb-5">{campus.grades}</p>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200 group/link"
        >
          View School
          <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform duration-200" />
        </a>
      </div>
    </motion.div>
  );
}

function CampusesSection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="text-accent text-xs font-bold tracking-widest uppercase">Our Schools</span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="text-primary text-3xl md:text-[2.5rem] font-bold mb-4 tracking-tight">Our Campuses</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-[0.95rem] leading-relaxed">
            Each campus is thoughtfully designed to provide an environment where students can thrive academically and personally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {campuses.map((c, i) => (
            <CampusCard key={c.name} campus={c} index={i} />
          ))}
          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="bg-primary/4 border-2 border-dashed border-primary/15 rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[360px]"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={20} className="text-primary/40" strokeWidth={1.5} />
            </div>
            <span className="text-accent text-[10px] font-bold tracking-widest uppercase mb-2">Coming Soon</span>
            <h3 className="text-primary font-bold text-base mb-3">Future Campus</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We are expanding our network to serve more families across Alborz Province.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ────────────────────────────────────────────────────────────
const features = [
  { icon: Monitor, title: "Smart Classrooms", desc: "Interactive whiteboards, tablets, and tech-integrated curriculum for digital-native learners." },
  { icon: FlaskConical, title: "Modern Laboratories", desc: "Fully equipped science labs enabling hands-on exploration and experimental discovery." },
  { icon: BookOpen, title: "Premium Library", desc: "Thousands of curated titles and digital resources supporting every area of study." },
  { icon: Dumbbell, title: "Sports Facilities", desc: "Indoor and outdoor environments promoting physical well-being and team spirit." },
  { icon: Globe, title: "Language Programs", desc: "English and additional language instruction integrated from the earliest grades." },
  { icon: Music, title: "Cultural Activities", desc: "Arts, music, and cultural programs nurturing creativity, expression, and identity." },
];

function WhyChooseSection() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="text-accent text-xs font-bold tracking-widest uppercase">Why Choose Us</span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="text-primary text-3xl md:text-[2.5rem] font-bold mb-4 tracking-tight">Built for Excellence</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-[0.95rem] leading-relaxed">
            Every aspect of our schools is purpose-built to give students the strongest possible foundation for their futures.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group p-6 rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 cursor-default"
            >
              <div className="w-11 h-11 bg-primary/6 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors duration-300">
                <Icon size={20} className="text-primary group-hover:text-accent transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-primary font-bold text-sm mb-2">{title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────
const achievements = [
  { number: "1st", label: "Place in 5 Consecutive Provincial Academic Olympiads" },
  { number: "97%", label: "University Acceptance Rate Among Our Graduates" },
  { number: "280+", label: "National and Regional Competition Medals Earned" },
  { number: "15+", label: "Ministry of Education Excellence Awards Received" },
];

function AchievementsSection() {
  return (
    <section className="py-24 md:py-32 bg-primary overflow-hidden relative">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-accent/70" />
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Achievements</span>
            </div>
            <h2 className="text-white text-3xl md:text-[2.5rem] font-bold leading-tight mb-6 tracking-tight">
              A Legacy of<br />Academic Excellence
            </h2>
            <p className="text-white/55 leading-relaxed mb-10 max-w-md text-[0.95rem]">
              Our students consistently excel at regional and national levels — a testament to the quality, dedication, and passion that define Nedaye Haghighat.
            </p>
            <div className="flex items-center gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 max-w-sm">
              <Trophy size={44} className="text-accent flex-shrink-0" strokeWidth={1} />
              <div>
                <div className="text-accent text-4xl font-bold leading-none mb-1">20+</div>
                <div className="text-white/50 text-xs font-medium">Consecutive Years of Ranked Excellence</div>
              </div>
            </div>
          </motion.div>

          {/* Right: list */}
          <div className="flex flex-col gap-3">
            {achievements.map(({ number, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-5 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/8 transition-all duration-300"
              >
                <div className="text-accent text-2xl font-bold min-w-[60px] text-center">{number}</div>
                <div className="w-px h-8 bg-white/15 flex-shrink-0" />
                <div className="text-white/75 text-sm leading-relaxed">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── News ─────────────────────────────────────────────────────────────────────
const news = [
  {
    image: "https://images.unsplash.com/photo-1762475833699-53a01f26565a?w=600&h=400&fit=crop&auto=format",
    category: "Olympiad",
    date: "May 2025",
    title: "Students Claim Gold at Regional Science Olympiad",
    excerpt: "For the fifth consecutive year, Nedaye Haghighat students demonstrated exceptional academic prowess at the regional Science Olympiad, securing first place.",
  },
  {
    image: "https://images.unsplash.com/photo-1527822618093-743f3e57977c?w=600&h=400&fit=crop&auto=format",
    category: "Campus Update",
    date: "April 2025",
    title: "New Smart Classrooms Inaugurated Across All Campuses",
    excerpt: "State-of-the-art digital learning technology has been installed at all three campuses, creating a transformative new experience for students and teachers alike.",
  },
  {
    image: "https://images.unsplash.com/photo-1658051079141-b50a32987f0b?w=600&h=400&fit=crop&auto=format",
    category: "Events",
    date: "March 2025",
    title: "Annual Academic Awards Ceremony 2025",
    excerpt: "Our annual celebration of student excellence returns, honoring outstanding academic achievements, extracurricular contributions, and school community leadership.",
  },
];

function NewsSection() {
  return (
    <section className="py-24 md:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-accent" />
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Latest News</span>
            </div>
            <h2 className="text-primary text-3xl md:text-[2.5rem] font-bold tracking-tight">From Our Schools</h2>
          </div>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200 flex-shrink-0">
            View All News <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map(({ image, category, date, title, excerpt }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="relative overflow-hidden h-48 bg-muted">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{category}</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Calendar size={10} strokeWidth={1.5} />
                    {date}
                  </span>
                </div>
                <h3 className="text-primary font-bold text-base mb-2.5 leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-5 line-clamp-3">{excerpt}</p>
                <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent transition-colors duration-200">
                  Read More <ArrowRight size={11} />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
const galleryImages = [
  { src: "https://images.unsplash.com/photo-1762475833699-53a01f26565a?w=600&h=800&fit=crop&auto=format", alt: "Student reading in the school library", tall: true },
  { src: "https://images.unsplash.com/photo-1527822618093-743f3e57977c?w=600&h=400&fit=crop&auto=format", alt: "Students engaged in classroom activity", tall: false },
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop&auto=format", alt: "Teacher leading an interactive lesson", tall: false },
  { src: "https://images.unsplash.com/photo-1771909712463-b1c7b542f845?w=600&h=800&fit=crop&auto=format", alt: "School sports and recreation facilities", tall: true },
  { src: "https://images.unsplash.com/photo-1762475833776-fd57865db4d5?w=600&h=400&fit=crop&auto=format", alt: "Girls studying together in a shared space", tall: false },
  { src: "https://images.unsplash.com/photo-1614595737766-4d7e1fd1406f?w=600&h=400&fit=crop&auto=format", alt: "Campus building exterior view", tall: false },
];

function GallerySection() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-8 bg-accent" />
            <span className="text-accent text-xs font-bold tracking-widest uppercase">Gallery</span>
            <div className="h-px w-8 bg-accent" />
          </div>
          <h2 className="text-primary text-3xl md:text-[2.5rem] font-bold tracking-tight">Life at Our Schools</h2>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
          style={{ gridAutoRows: "200px" }}
        >
          {galleryImages.map(({ src, alt, tall }) => (
            <div
              key={src}
              className={`relative overflow-hidden rounded-xl md:rounded-2xl bg-muted group ${tall ? "row-span-2" : ""}`}
            >
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-400" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "48px 48px" }}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-accent/60" />
            <span className="text-accent text-xs font-bold tracking-widest uppercase">Join Our Family</span>
            <div className="h-px w-8 bg-accent/60" />
          </div>
          <h2 className="text-white text-3xl md:text-5xl font-bold mb-5 max-w-2xl mx-auto leading-tight tracking-tight">
            Begin Your Child&apos;s Journey to Excellence
          </h2>
          <p className="text-white/55 max-w-xl mx-auto mb-10 text-[0.95rem] leading-relaxed">
            Join thousands of families who trust Nedaye Haghighat to nurture their children&apos;s potential. Limited places are available for the upcoming academic year.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary font-bold text-sm rounded-full hover:bg-[#b8921f] transition-colors duration-200 shadow-xl shadow-accent/20"
            >
              Start Pre-registration
              <ArrowRight size={15} />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white text-sm font-medium rounded-full hover:border-accent hover:text-accent transition-all duration-200"
            >
              Schedule a Campus Visit
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0A1E38] text-white/50 text-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black text-sm">NH</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm">Nedaye Haghighat</div>
                <div className="text-white/30 text-[11px] font-medium">Educational Group</div>
              </div>
            </a>
            <p className="text-[0.82rem] leading-relaxed mb-6">
              Shaping the next generation through excellence, values, and modern education across Alborz Province.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { href: "#", icon: Instagram, label: "Instagram" },
                { href: "#", icon: Send, label: "Telegram" },
                { href: "#", icon: Play, label: "Aparat" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 bg-white/5 hover:bg-accent/20 rounded-lg flex items-center justify-center transition-colors duration-200 hover:text-accent"
                >
                  <Icon size={13} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {["Home", "Our Schools", "About Us", "News & Events", "Pre-registration", "Contact"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[0.82rem] hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                    <ChevronRight size={11} className="opacity-30" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Schools */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Our Schools</h4>
            <ul className="space-y-2.5">
              {["Boys Primary School", "Girls Primary School", "Girls Middle School"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[0.82rem] hover:text-accent transition-colors duration-200 flex items-center gap-1.5">
                    <ChevronRight size={11} className="opacity-30" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">Contact Us</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin size={13} className="text-accent mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-[0.82rem] leading-relaxed">Karaj, Alborz Province,<br />Islamic Republic of Iran</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={13} className="text-accent flex-shrink-0" strokeWidth={1.5} />
                <a href="tel:+982634567890" className="text-[0.82rem] hover:text-accent transition-colors duration-200">+98 26 3456 7890</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={13} className="text-accent flex-shrink-0" strokeWidth={1.5} />
                <a href="mailto:info@nedayehaghighat.ir" className="text-[0.82rem] hover:text-accent transition-colors duration-200">info@nedayehaghighat.ir</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2025 Nedaye Haghighat Educational Group. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <a href="#" className="hover:text-accent transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors duration-200">Terms of Use</a>
            <a href="#" className="hover:text-accent transition-colors duration-200">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when modal or drawer is open
  useEffect(() => {
    document.body.style.overflow = portalOpen || mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [portalOpen, mobileOpen]);

  return (
    <div style={{ fontFamily: "'Vazirmatn', sans-serif" }} className="bg-white text-foreground">
      <TopBar />
      <Navbar
        onPortalOpen={() => setPortalOpen(true)}
        scrolled={scrolled}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <PortalModal isOpen={portalOpen} onClose={() => setPortalOpen(false)} />

      <main>
        <HeroSection onPortalOpen={() => setPortalOpen(true)} />
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
    </div>
  );
}
