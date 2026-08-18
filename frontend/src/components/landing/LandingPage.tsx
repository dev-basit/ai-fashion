"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/config/constants";
import {
  LANDING_MARQUEE,
  LANDING_STATS,
  LANDING_GALLERY_PHOTOS,
  LANDING_HERO_PHOTOS,
  LANDING_CLIENT_AVATARS,
  LANDING_FEATURES,
  LANDING_ROLES,
} from "@/config/website";
import { useInView } from "./useInView";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LogoSidebar, LogoIcon } from "@/components/common/Logo";
import {
  Calendar,
  Users,
  Scissors,
  ShoppingBag,
  MessageSquare,
  BarChart2,
  ClipboardList,
  FileText,
  Shield,
  Star,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  Lock,
  Layers,
} from "lucide-react";

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <svg
      viewBox="0 0 580 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      <rect width="580" height="380" rx="14" fill="#0d0d0d" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect width="580" height="42" rx="14" fill="#141414" />
      <rect y="28" width="580" height="14" fill="#141414" />
      <circle cx="22" cy="21" r="5" fill="#3a3a3a" />
      <circle cx="38" cy="21" r="5" fill="#3a3a3a" />
      <circle cx="54" cy="21" r="5" fill="#3a3a3a" />
      <rect x="250" y="15" width="80" height="10" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="0" y="42" width="158" height="338" fill="#111111" />
      <rect x="158" y="42" width="1" height="338" fill="rgba(255,255,255,0.06)" />
      <rect x="16" y="58" width="88" height="10" rx="3" fill="rgba(255,255,255,0.18)" />
      <rect x="10" y="86" width="138" height="28" rx="6" fill="rgba(255,255,255,0.08)" />
      <rect x="22" y="95" width="8" height="8" rx="2" fill="rgba(255,255,255,0.55)" />
      <rect x="36" y="97" width="52" height="6" rx="2" fill="rgba(255,255,255,0.45)" />
      <rect x="22" y="128" width="8" height="8" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="36" y="130" width="64" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="22" y="158" width="8" height="8" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="36" y="160" width="48" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="22" y="188" width="8" height="8" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="36" y="190" width="56" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="22" y="218" width="8" height="8" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="36" y="220" width="44" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="22" y="248" width="8" height="8" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="36" y="250" width="60" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="178" y="58" width="88" height="12" rx="3" fill="rgba(255,255,255,0.2)" />
      <rect
        x="178"
        y="86"
        width="90"
        height="52"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="190" y="98" width="38" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
      <rect x="190" y="113" width="58" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect
        x="278"
        y="86"
        width="90"
        height="52"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="290" y="98" width="42" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
      <rect x="290" y="113" width="52" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect
        x="378"
        y="86"
        width="90"
        height="52"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="390" y="98" width="36" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
      <rect x="390" y="113" width="60" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect
        x="478"
        y="86"
        width="88"
        height="52"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="490" y="98" width="32" height="7" rx="2" fill="rgba(255,255,255,0.1)" />
      <rect x="490" y="113" width="56" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="178" y="154" width="110" height="8" rx="3" fill="rgba(255,255,255,0.16)" />
      <rect
        x="178"
        y="174"
        width="196"
        height="64"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <circle cx="200" cy="200" r="13" fill="rgba(255,255,255,0.06)" />
      <rect x="222" y="191" width="70" height="7" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="222" y="205" width="52" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="222" y="220" width="38" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
      <circle cx="358" cy="200" r="5" fill="#4ade80" fillOpacity="0.8" />
      <rect
        x="178"
        y="248"
        width="196"
        height="64"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <circle cx="200" cy="274" r="13" fill="rgba(255,255,255,0.06)" />
      <rect x="222" y="265" width="62" height="7" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="222" y="279" width="58" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="222" y="294" width="38" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
      <circle cx="358" cy="274" r="5" fill="#f59e0b" fillOpacity="0.8" />
      <rect
        x="384"
        y="154"
        width="182"
        height="160"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <rect x="398" y="168" width="66" height="7" rx="2" fill="rgba(255,255,255,0.16)" />
      <rect x="398" y="202" width="14" height="70" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="418" y="218" width="14" height="54" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="438" y="194" width="14" height="78" rx="3" fill="rgba(255,255,255,0.2)" />
      <rect x="458" y="210" width="14" height="62" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="478" y="188" width="14" height="84" rx="3" fill="rgba(255,255,255,0.32)" />
      <rect x="498" y="206" width="14" height="66" rx="3" fill="rgba(255,255,255,0.1)" />
      <rect x="518" y="196" width="14" height="76" rx="3" fill="rgba(255,255,255,0.14)" />
      <rect x="396" y="302" width="162" height="1" fill="rgba(255,255,255,0.06)" />
      <rect
        x="178"
        y="324"
        width="388"
        height="40"
        rx="8"
        fill="#191919"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
      <circle cx="198" cy="344" r="10" fill="rgba(255,255,255,0.05)" />
      <rect x="216" y="339" width="60" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="216" y="352" width="44" height="5" rx="2" fill="rgba(255,255,255,0.08)" />
      <circle cx="548" cy="344" r="4" fill="#818cf8" fillOpacity="0.7" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-inner { animation: marquee 38s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }

        @keyframes float    { 0%,100% { transform: translateY(0px);   } 50% { transform: translateY(-10px); } }
        @keyframes float-b  { 0%,100% { transform: translateY(-4px);  } 50% { transform: translateY(6px);  } }
        .float-a { animation: float   6s ease-in-out infinite; }
        .float-b { animation: float-b 7s ease-in-out infinite; }

        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.35; } }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 100%; height: 1px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }

        .feature-card { transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease; }
        .feature-card:hover {
          border-color: hsl(var(--foreground) / 0.2);
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .dark .feature-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
        .feature-icon-wrap { transition: background 0.2s ease, transform 0.2s ease; }
        .feature-card:hover .feature-icon-wrap {
          background: var(--foreground);
          transform: scale(1.08);
        }
        .feature-card:hover .feature-icon-wrap svg { color: var(--background) !important; }

        .role-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .role-card:hover { transform: translateY(-5px); }

        .stat-item { transition: opacity 0.2s ease; }
        .stat-item:hover { opacity: 0.8; }

        .gallery-img { transition: transform 0.5s ease, filter 0.3s ease; filter: grayscale(100%); }
        .gallery-card:hover .gallery-img { transform: scale(1.04); filter: grayscale(60%); }
      `}</style>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-border bg-background/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 h-16 flex items-center justify-between">
          <LogoSidebar />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link
                href={ROUTES.dashboard}
                className="group inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.login}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
                >
                  Get started{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-30 sm:pb-28">
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 block dark:hidden"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs text-muted-foreground mb-8">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-foreground/60 flex-shrink-0" />
                <Sparkles className="h-3 w-3" />
                Salon management, reimagined
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-bold tracking-tight leading-[1.04] mb-7">
                The complete
                <br />
                platform for
                <br />
                <span className="relative">
                  modern salons
                  <span className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px bg-foreground/20 hidden sm:block" />
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Glow By Miral unifies appointments, client records, staff management, products, and analytics into
                one elegant workspace.
              </p>

              {/* Mini stats pills */}
              <div className="flex flex-wrap gap-2 mb-9">
                {["Appointments", "Client records", "Staff scheduling", "Live analytics"].map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1 bg-muted/30"
                  >
                    <Check className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />
                    {pill}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {isLoggedIn ? (
                  <Link
                    href={ROUTES.dashboard}
                    className="group inline-flex items-center justify-center gap-2 text-[15px] font-semibold px-7 py-3.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
                  >
                    Go to Dashboard{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={ROUTES.login}
                      className="group inline-flex items-center justify-center gap-2 text-[15px] font-semibold px-7 py-3.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
                    >
                      Get started free{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href={ROUTES.login}
                      className="group inline-flex items-center justify-center gap-2 text-[15px] font-medium px-7 py-3.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      Sign in
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </>
                )}
              </div>

              {/* Photo proof strip */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {LANDING_HERO_PHOTOS.map((p, i) => (
                    <div
                      key={i}
                      className="relative w-10 h-10 rounded-full border-2 border-background overflow-hidden flex-shrink-0"
                      style={{ zIndex: LANDING_HERO_PHOTOS.length - i }}
                    >
                      <Image src={p.src} alt={p.alt} fill className="object-cover grayscale" sizes="40px" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <p className="text-[12px] text-muted-foreground">Loved by salon teams</p>
                </div>
              </div>
            </div>

            {/* Mockup */}
            <div className="relative hidden lg:block">
              <div
                className="pointer-events-none absolute inset-0 blur-3xl opacity-0 dark:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.06), transparent 70%)",
                }}
              />
              <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl dark:shadow-black/60 transition-transform duration-500 hover:scale-[1.015]">
                <DashboardMockup />
              </div>

              {/* Floating notification */}
              <div className="float-a absolute -left-10 bottom-20 rounded-2xl p-3.5 flex items-center gap-3 bg-card border border-border shadow-xl min-w-[210px]">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-border relative">
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=75&auto=format&fit=crop&crop=face"
                    alt="Client"
                    fill
                    className="object-cover grayscale"
                    sizes="36px"
                  />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Appointment confirmed</p>
                  <p className="text-[12px] text-muted-foreground">Hair treatment · 2:30 PM</p>
                </div>
              </div>

              {/* Floating stat */}
              <div className="float-b absolute -right-6 top-16 rounded-2xl p-4 bg-card border border-border shadow-xl">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  This month
                </p>
                <p className="text-3xl font-bold text-foreground leading-none">24</p>
                <p className="text-[12px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> appointments
                </p>
              </div>

              {/* Floating badge */}
              <div className="float-a absolute -right-4 bottom-10 rounded-xl px-3 py-2 bg-foreground text-background shadow-xl flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-[12px] font-semibold">Real-time sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden py-4 border-t border-b border-border bg-muted/20">
        <div className="pointer-events-none absolute left-0 inset-y-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />
        <div className="marquee-inner flex gap-10 w-max">
          {[...LANDING_MARQUEE, ...LANDING_MARQUEE].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
              <item.icon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.6} />
              <span className="text-sm text-muted-foreground/60 whitespace-nowrap">{item.label}</span>
              <span className="ml-3 text-border">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gallery strip ────────────────────────────────────────────────── */}
      <section className="py-14 px-5 sm:px-10 border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {LANDING_GALLERY_PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="gallery-card group relative overflow-hidden rounded-2xl aspect-[4/3] border border-border"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="gallery-img object-cover"
                  sizes="(max-width: 768px) 33vw, 400px"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-xs font-semibold text-background bg-foreground/80 backdrop-blur-sm rounded-full px-3 py-1">
                    {photo.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-10 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {LANDING_STATS.map((s, i) => (
              <div key={i} className="stat-item bg-background px-8 py-8 text-center">
                <p className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (Bento) ─────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-5 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Features</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  Everything you need
                  <br />
                  to run a modern salon
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                From booking to billing, every tool your team needs is built in from day one.
              </p>
            </div>
          </FadeIn>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Wide card — Scheduling */}
            <FadeIn delay={0} className="lg:col-span-2">
              <div className="feature-card h-full rounded-2xl border border-border bg-card overflow-hidden flex flex-col sm:flex-row">
                <div className="flex-shrink-0 p-8">
                  <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                    <Calendar className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                  </div>
                  <h3 className="font-semibold text-[17px] text-foreground mb-2">{LANDING_FEATURES[0].title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xs">
                    {LANDING_FEATURES[0].desc}
                  </p>
                </div>
                {/* Photo */}
                <div className="flex-1 relative min-h-[180px] sm:min-h-0">
                  <Image
                    src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80&auto=format&fit=crop"
                    alt="Appointment scheduling"
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-card via-card/30 to-transparent pointer-events-none" />
                </div>
              </div>
            </FadeIn>

            {/* Client Profiles — with real avatars */}
            <FadeIn delay={60}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <Users className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[1].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[1].desc}</p>
                <div className="mt-auto pt-4 space-y-2">
                  {LANDING_CLIENT_AVATARS.map(({ name, tag, src }) => (
                    <div
                      key={name}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/50"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-border relative">
                        <Image src={src} alt={name} fill className="object-cover grayscale" sizes="28px" />
                      </div>
                      <span className="text-[12px] text-muted-foreground">{name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60">{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Consultation Forms */}
            <FadeIn delay={90}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[2].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[2].desc}</p>
              </div>
            </FadeIn>

            {/* Treatment Plans */}
            <FadeIn delay={110}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <FileText className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[3].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[3].desc}</p>
              </div>
            </FadeIn>

            {/* Products & Orders */}
            <FadeIn delay={130}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[4].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[4].desc}</p>
              </div>
            </FadeIn>

            {/* Wide card — Chat with photo background */}
            <FadeIn delay={60} className="lg:col-span-2">
              <div className="feature-card h-full rounded-2xl border border-border bg-card overflow-hidden flex flex-col sm:flex-row-reverse">
                <div className="flex-shrink-0 p-8">
                  <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
                    <MessageSquare className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                  </div>
                  <h3 className="font-semibold text-[17px] text-foreground mb-2">{LANDING_FEATURES[5].title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-xs">
                    {LANDING_FEATURES[5].desc}
                  </p>
                  {/* Chat bubbles */}
                  <div className="mt-5 space-y-2">
                    {[
                      { from: "staff", text: "Your 3 PM slot is confirmed!" },
                      { from: "client", text: "Perfect, thank you 😊" },
                      { from: "staff", text: "See you soon!" },
                    ].map((msg, j) => (
                      <div key={j} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`rounded-2xl px-3 py-1.5 text-[12px] max-w-[85%] ${
                            msg.from === "client"
                              ? "bg-foreground text-background"
                              : "bg-muted border border-border text-foreground"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Photo */}
                <div className="flex-1 relative min-h-[180px] sm:min-h-0">
                  <Image
                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80&auto=format&fit=crop"
                    alt="Stylist providing service to client"
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-card via-card/30 to-transparent pointer-events-none sm:bg-gradient-to-r" />
                </div>
              </div>
            </FadeIn>

            {/* Reports */}
            <FadeIn delay={90}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <BarChart2 className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[6].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[6].desc}</p>
              </div>
            </FadeIn>

            {/* Services */}
            <FadeIn delay={110}>
              <div className="feature-card h-full rounded-2xl border border-border bg-card p-8 flex flex-col gap-4">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px] text-foreground">{LANDING_FEATURES[7].title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{LANDING_FEATURES[7].desc}</p>
              </div>
            </FadeIn>

            {/* Security — inverted accent card */}
            <FadeIn delay={130}>
              <div className="feature-card h-full rounded-2xl border border-foreground/10 bg-foreground text-background p-8 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background/10 border border-background/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-background" strokeWidth={1.7} />
                </div>
                <h3 className="font-semibold text-[16px]">Role-based access</h3>
                <p className="text-[14px] text-background/70 leading-relaxed">
                  Fine-grained permissions ensure every user sees exactly what they should — nothing more.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-28 px-5 sm:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Roles</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built for every role</h2>
            <p className="text-base text-muted-foreground">One platform, three tailored experiences.</p>
          </FadeIn>

          <div className="grid gap-4 md:grid-cols-3">
            {LANDING_ROLES.map((r, i) => (
              <FadeIn key={r.role} delay={i * 100}>
                <div
                  className={`role-card rounded-2xl p-8 h-full flex flex-col gap-7 ${
                    r.inverted
                      ? "bg-foreground text-background"
                      : "bg-card border border-border hover:border-foreground/25 hover:shadow-lg dark:hover:shadow-black/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${r.inverted ? "bg-background/10 border border-background/10" : "bg-muted border border-border"}`}
                      >
                        <r.icon
                          className={`h-4 w-4 ${r.inverted ? "text-background" : "text-foreground"}`}
                          strokeWidth={1.8}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${r.inverted ? "text-background/50" : "text-muted-foreground"}`}
                      >
                        {r.role}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-4">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${r.inverted ? "bg-background/10" : "bg-muted border border-border"}`}
                        >
                          <Check
                            className={`h-3 w-3 ${r.inverted ? "text-background/60" : "text-muted-foreground"}`}
                            strokeWidth={2.5}
                          />
                        </div>
                        <span
                          className={`text-[14px] leading-snug ${r.inverted ? "text-background/70" : "text-muted-foreground"}`}
                        >
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-10 border-t border-border">
        <FadeIn>
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border">
            {/* Background photo */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80&auto=format&fit=crop"
                alt="Salon background"
                fill
                className="object-cover grayscale opacity-[0.07] dark:opacity-[0.12]"
                sizes="(max-width: 1280px) 100vw, 1024px"
              />
            </div>
            {/* Overlay card */}
            <div className="relative bg-card/90 backdrop-blur-sm p-16 sm:p-24 text-center">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

              {/* Logo mark */}
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center shadow-lg">
                  <LogoIcon className="h-7 w-7 text-background" />
                </div>
              </div>

              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Get started today</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.06] mb-5">
                Ready to glow up
                <br />
                your business?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto mb-10">
                Join Glow By Miral and give your team and clients the seamless, modern experience they deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {isLoggedIn ? (
                  <Link
                    href={ROUTES.dashboard}
                    className="group inline-flex items-center gap-2 text-[15px] font-semibold px-8 py-3.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
                  >
                    Go to Dashboard{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={ROUTES.login}
                      className="group inline-flex items-center gap-2 text-[15px] font-semibold px-8 py-3.5 rounded-full bg-foreground text-background hover:opacity-85 transition-opacity"
                    >
                      Get started free{" "}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href={ROUTES.login}
                      className="group inline-flex items-center gap-2 text-[15px] font-medium px-8 py-3.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      Sign in instead
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-12 px-5 sm:px-10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div>
              <LogoSidebar />
              <p className="text-[13px] text-muted-foreground mt-3 max-w-xs leading-relaxed">
                The complete management platform for modern salons and spas.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Product
                </p>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#features"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#how-it-works"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      How it works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#roles"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Roles
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Account
                </p>
                <ul className="space-y-3">
                  {isLoggedIn ? (
                    <li>
                      <Link
                        href={ROUTES.dashboard}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Dashboard
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href={ROUTES.login}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Sign in
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href={ROUTES.profile}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-muted-foreground">
              © {new Date().getFullYear()} Glow By Miral. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              Built for modern beauty businesses
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
