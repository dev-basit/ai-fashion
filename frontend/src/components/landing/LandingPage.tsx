"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/config/constants";
import {
  LANDING_MARQUEE,
  LANDING_STATS,
  LANDING_GALLERY_PHOTOS,
  LANDING_HERO_PHOTOS,
  LANDING_FEATURES,
  LANDING_ROLES,
} from "@/config/website";
import { useInView } from "./useInView";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";

// ── Hero "how it works" trio ────────────────────────────────────────────────
const HERO_STEPS = [
  { k: "Book", d: "Appointments, consultations, and reminders in one shared calendar." },
  { k: "Care", d: "Client histories, treatment plans, and chat that never drops a note." },
  { k: "Grow", d: "Revenue, staff, and product insight — exported in a single click." },
];

const EDGE = "mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-14";
const BTN_PRIMARY =
  "group inline-flex items-center justify-center gap-2.5 bg-foreground text-background px-7 py-4 font-mono text-[12px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity";
const BTN_GHOST =
  "group inline-flex items-center justify-center gap-2.5 border border-border text-foreground px-7 py-4 font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors";

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "scale";
}) {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      data-v={variant}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Editorial photo with figure caption ──────────────────────────────────────
function EdFigure({
  src,
  alt,
  label,
  fig,
  aspect,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  label: string;
  fig: string;
  aspect: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <figure className={`ed-media group relative overflow-hidden ${aspect}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="ed-img object-cover" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10" />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white mix-blend-difference">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{label}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{fig}</span>
      </figcaption>
    </figure>
  );
}

// ── Thin reading-progress line ────────────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(el.scrollTop / max, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-px pointer-events-none">
      <div className="h-full origin-left bg-foreground" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(document.documentElement.scrollTop > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const marquee = [...LANDING_MARQUEE, ...LANDING_MARQUEE];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-foreground selection:text-background">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 42s linear infinite; }
        .marquee-wrap:hover .marquee-track { animation-play-state: paused; }

        @keyframes enter { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        .enter { opacity: 0; animation: enter 1s cubic-bezier(0.22,1,0.36,1) forwards; }

        .reveal {
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
          will-change: opacity, transform;
        }
        .reveal[data-v="scale"] { transform: scale(0.955); }
        .reveal.is-in { opacity: 1; transform: none; }

        .nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -5px;
          height: 1px; width: 100%; background: currentColor;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .nav-link:hover::after { transform: scaleX(1); }

        .ed-img { filter: grayscale(100%) contrast(1.03); transition: transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease; }
        .ed-media:hover .ed-img { transform: scale(1.05); filter: grayscale(35%); }

        .idx-row { transition: background-color 0.4s ease; }
        .idx-title { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
        .idx-row:hover .idx-title { transform: translateX(14px); }
        .idx-arrow { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease; }
        .idx-row:hover .idx-arrow { transform: translate(6px,-6px); opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track, .enter { animation: none !important; }
          .enter { opacity: 1 !important; transform: none !important; }
          .reveal { transition: none !important; opacity: 1 !important; transform: none !important; }
          .ed-img { transition: none !important; }
        }
      `}</style>

      <ScrollProgress />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className={`${EDGE} h-20 flex items-center justify-between`}>
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-[26px] leading-none tracking-tight">Glow</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">By Miral</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="#index" className="nav-link relative hover:text-foreground transition-colors">
              Index
            </Link>
            <Link href="#atelier" className="nav-link relative hover:text-foreground transition-colors">
              Atelier
            </Link>
            <Link href="#roles" className="nav-link relative hover:text-foreground transition-colors">
              Roles
            </Link>
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href={ROUTES.dashboard} className={BTN_PRIMARY + " !px-4 sm:!px-5 !py-2.5 !text-[11px]"}>
                Dashboard
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link href={ROUTES.login} className={BTN_PRIMARY + " !px-4 sm:!px-5 !py-2.5 !text-[11px]"}>
                  Get started
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none select-none absolute -bottom-[0.18em] left-1 font-serif italic text-foreground/[0.045] text-[34vw] leading-none"
        >
          Glow
        </div>

        <div className={`relative ${EDGE} pt-32 sm:pt-40 pb-16 sm:pb-20`}>
          {/* Headline row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-8">
              <p className="enter font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-7">
                <span className="text-foreground">(01)</span>&nbsp;&nbsp;—&nbsp;&nbsp;Premium salon management
              </p>
              <h1 className="enter font-serif font-medium tracking-[-0.02em] leading-[0.9] text-[clamp(3.25rem,12vw,9.5rem)]" style={{ animationDelay: "0.08s" }}>
                Beauty,
                <br />
                <span className="italic font-normal">reimagined.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <div className="enter h-px w-full bg-border mb-6" style={{ animationDelay: "0.16s" }} />
              <p className="enter text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-sm" style={{ animationDelay: "0.2s" }}>
                Glow By Miral unifies appointments, client records, staff, products, and analytics into one elegant,
                editorial workspace.
              </p>
            </div>
          </div>

          {/* Media + actions row */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="enter lg:col-span-7" style={{ animationDelay: "0.24s" }}>
              <EdFigure
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1400&q=80&auto=format&fit=crop"
                alt="Stylist attending to a client"
                label="The Glow atelier"
                fig="Fig. 01"
                aspect="aspect-[16/10] sm:aspect-[16/9]"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            </div>

            <div className="enter lg:col-span-5 flex flex-col justify-between gap-10" style={{ animationDelay: "0.3s" }}>
              <ol className="border-t border-border">
                {HERO_STEPS.map((s, i) => (
                  <li key={s.k} className="flex gap-5 border-b border-border py-5">
                    <span className="font-mono text-xs text-muted-foreground pt-1.5 tabular-nums">0{i + 1}</span>
                    <div>
                      <h3 className="font-serif text-2xl leading-none">{s.k}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {isLoggedIn ? (
                    <Link href={ROUTES.dashboard} className={BTN_PRIMARY}>
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <>
                      <Link href={ROUTES.login} className={BTN_PRIMARY}>
                        Get started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link href={ROUTES.login} className={BTN_GHOST}>
                        Sign in
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {LANDING_HERO_PHOTOS.map((p, i) => (
                      <div
                        key={i}
                        className="relative w-9 h-9 rounded-full border-2 border-background overflow-hidden"
                        style={{ zIndex: LANDING_HERO_PHOTOS.length - i }}
                      >
                        <Image src={p.src} alt={p.alt} fill sizes="36px" className="object-cover grayscale" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
                      ))}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Loved by salon teams
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kinetic marquee ──────────────────────────────────────────────── */}
      <section className="marquee-wrap relative overflow-hidden border-y border-border py-6 sm:py-9">
        <div className="marquee-track flex w-max items-center">
          {marquee.map((item, i) => (
            <span key={i} className="flex items-center">
              <span className="font-serif italic text-3xl sm:text-5xl text-foreground/80 whitespace-nowrap px-8 sm:px-12">
                {item.label}
              </span>
              <span className="font-serif text-2xl sm:text-3xl text-muted-foreground/40">✳</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent" />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className={`${EDGE} py-20 sm:py-28`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {LANDING_STATS.map((s, i) => (
            <Reveal key={i} delay={i * 80} className="bg-background">
              <div className="px-6 sm:px-8 py-10 sm:py-14">
                <div className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-none tracking-[-0.02em]">
                  {s.value}
                </div>
                <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Index (features) ─────────────────────────────────────────────── */}
      <section id="index" className={`${EDGE} pb-20 sm:pb-28`}>
        <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end mb-12 sm:mb-16">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              <span className="text-foreground">(02)</span>&nbsp;&nbsp;—&nbsp;&nbsp;The index
            </p>
            <h2 className="font-serif tracking-[-0.02em] leading-[0.95] text-[clamp(2.25rem,6.5vw,4.75rem)]">
              Everything the modern
              <br />
              salon needs, <span className="italic">built in.</span>
            </h2>
          </div>
          <p className="lg:col-span-4 text-sm text-muted-foreground leading-relaxed lg:pb-3">
            Eight core modules. Three roles. One unified workspace designed for the way salons actually run.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Sticky image */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-28">
              <EdFigure
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80&auto=format&fit=crop"
                alt="Hair care treatment in progress"
                label="Designed for busy days"
                fig="Fig. 02"
                aspect="aspect-[4/5]"
                sizes="40vw"
              />
            </div>
          </div>

          {/* Numbered list */}
          <div className="lg:col-span-7 border-t border-border">
            {LANDING_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) * 60}>
                <div className="idx-row group grid grid-cols-[auto_1fr_auto] items-start gap-4 sm:gap-6 border-b border-border py-6 sm:py-7 px-2 sm:px-4 -mx-2 sm:-mx-4 hover:bg-muted/40">
                  <span className="font-mono text-xs text-muted-foreground pt-2 tabular-nums">0{i + 1}</span>
                  <div className="idx-title">
                    <div className="flex items-center gap-3">
                      <f.icon className="h-4 w-4 text-foreground" strokeWidth={1.6} />
                      <h3 className="font-serif text-2xl sm:text-3xl leading-tight">{f.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">{f.desc}</p>
                  </div>
                  <ArrowUpRight className="idx-arrow h-5 w-5 text-muted-foreground opacity-40 mt-1.5" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Atelier (gallery) ────────────────────────────────────────────── */}
      <section id="atelier" className={`${EDGE} pb-20 sm:pb-28`}>
        <Reveal className="flex items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-5">
              <span className="text-foreground">(03)</span>&nbsp;&nbsp;—&nbsp;&nbsp;The atelier
            </p>
            <h2 className="font-serif tracking-[-0.02em] text-[clamp(2rem,5.5vw,3.75rem)]">
              A space to <span className="italic">glow.</span>
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Collection — 03
          </span>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <Reveal variant="scale" className="sm:col-span-7">
            <EdFigure
              src={LANDING_GALLERY_PHOTOS[0].src}
              alt={LANDING_GALLERY_PHOTOS[0].alt}
              label={LANDING_GALLERY_PHOTOS[0].label}
              fig="01"
              aspect="aspect-[4/3]"
              sizes="(max-width: 640px) 100vw, 58vw"
            />
          </Reveal>
          <Reveal variant="scale" delay={120} className="sm:col-span-5">
            <EdFigure
              src={LANDING_GALLERY_PHOTOS[1].src}
              alt={LANDING_GALLERY_PHOTOS[1].alt}
              label={LANDING_GALLERY_PHOTOS[1].label}
              fig="02"
              aspect="aspect-[4/3]"
              sizes="(max-width: 640px) 100vw, 42vw"
            />
          </Reveal>
          <Reveal variant="scale" delay={200} className="sm:col-span-12">
            <EdFigure
              src={LANDING_GALLERY_PHOTOS[2].src}
              alt={LANDING_GALLERY_PHOTOS[2].alt}
              label={LANDING_GALLERY_PHOTOS[2].label}
              fig="03"
              aspect="aspect-[16/9] sm:aspect-[21/9]"
              sizes="100vw"
            />
          </Reveal>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="border-t border-border">
        <div className={`${EDGE} py-20 sm:py-28`}>
          <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12 sm:mb-16">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                <span className="text-foreground">(04)</span>&nbsp;&nbsp;—&nbsp;&nbsp;Access
              </p>
              <h2 className="font-serif tracking-[-0.02em] leading-[0.95] text-[clamp(2.25rem,6.5vw,4.75rem)]">
                Built for <span className="italic">every</span> role.
              </h2>
            </div>
            <p className="lg:col-span-4 text-sm text-muted-foreground leading-relaxed lg:pb-3">
              One platform, three tailored experiences — admins, staff, and the clients they care for.
            </p>
          </Reveal>

          <div className="grid gap-px bg-border border border-border md:grid-cols-3">
            {LANDING_ROLES.map((r, i) => (
              <Reveal key={r.role} delay={i * 100} className={r.inverted ? "bg-foreground text-background" : "bg-background"}>
                <div className="h-full p-8 sm:p-10 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.25em] ${r.inverted ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      0{i + 1}
                    </span>
                    <r.icon
                      className={`h-5 w-5 ${r.inverted ? "text-background" : "text-foreground"}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-serif text-4xl sm:text-5xl mt-10 mb-1 leading-none">{r.role}</h3>
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.25em] ${r.inverted ? "text-background/50" : "text-muted-foreground"}`}
                  >
                    {r.role} access
                  </span>
                  <ul className="mt-8">
                    {r.perks.map((p, j) => (
                      <li
                        key={p}
                        className={`flex gap-4 py-3.5 text-sm border-t ${r.inverted ? "border-background/15 text-background/80" : "border-border text-muted-foreground"}`}
                      >
                        <span className="font-mono text-[11px] pt-0.5 opacity-60 tabular-nums">0{j + 1}</span>
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border">
        <div aria-hidden className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&q=80&auto=format&fit=crop"
            alt=""
            fill
            sizes="100vw"
            className="object-cover grayscale opacity-[0.06] dark:opacity-[0.1]"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none select-none absolute -top-[0.1em] right-2 font-serif italic text-foreground/[0.04] text-[30vw] leading-none"
        >
          glow
        </div>

        <div className={`relative ${EDGE} py-28 sm:py-40`}>
          <Reveal className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
              <span className="text-foreground">(05)</span>&nbsp;&nbsp;—&nbsp;&nbsp;Begin
            </p>
            <h2 className="font-serif tracking-[-0.02em] leading-[0.9] text-[clamp(2.75rem,10vw,7.5rem)]">
              Ready to glow up
              <br />
              your <span className="italic">business?</span>
            </h2>
            <p className="mt-8 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Give your team and clients the seamless, modern experience they deserve.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              {isLoggedIn ? (
                <Link href={ROUTES.dashboard} className={BTN_PRIMARY}>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <>
                  <Link href={ROUTES.login} className={BTN_PRIMARY}>
                    Get started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href={ROUTES.login} className={BTN_GHOST}>
                    Sign in instead
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className={`${EDGE} py-16`}>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="font-serif text-4xl">
                Glow <span className="italic">By Miral</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                The complete management platform for modern salons and spas.
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">Product</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="#index" className="text-muted-foreground hover:text-foreground transition-colors">
                    Index
                  </Link>
                </li>
                <li>
                  <Link href="#atelier" className="text-muted-foreground hover:text-foreground transition-colors">
                    Atelier
                  </Link>
                </li>
                <li>
                  <Link href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">
                    Roles
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-5">Account</p>
              <ul className="space-y-3 text-sm">
                {isLoggedIn ? (
                  <li>
                    <Link href={ROUTES.dashboard} className="text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link href={ROUTES.login} className="text-muted-foreground hover:text-foreground transition-colors">
                      Sign in
                    </Link>
                  </li>
                )}
                <li>
                  <Link href={ROUTES.profile} className="text-muted-foreground hover:text-foreground transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              © {new Date().getFullYear()} Glow By Miral
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Built for modern beauty businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
