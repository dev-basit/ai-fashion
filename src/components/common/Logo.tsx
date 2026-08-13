import { cn } from "@/lib/utils";

/** The glow spark mark — a 4-pointed star with four small accent dots */
function GlowMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 4-pointed sparkle star */}
      <path d="M16 1L17.5 14.5L31 16L17.5 17.5L16 31L14.5 17.5L1 16L14.5 14.5Z" fill="currentColor" />
      {/* Accent dots at 45° */}
      <circle cx="24" cy="8" r="1.4" fill="currentColor" opacity="0.45" />
      <circle cx="24" cy="24" r="1.4" fill="currentColor" opacity="0.45" />
      <circle cx="8" cy="24" r="1.4" fill="currentColor" opacity="0.45" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** Icon-only mark — use in very small / square contexts */
export function LogoIcon({ className }: { className?: string }) {
  return <GlowMark className={cn("h-6 w-6", className)} />;
}

/** Horizontal logo — icon + stacked wordmark, used in the sidebar */
export function LogoSidebar({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <GlowMark className="h-7 w-7 flex-shrink-0" />
      <div className="flex flex-col leading-none gap-[3px]">
        <span className="text-[8px] font-light tracking-[0.28em] uppercase opacity-60 select-none">Glow By</span>
        <span className="text-[13px] font-semibold tracking-[0.14em] uppercase select-none">Miral</span>
      </div>
    </div>
  );
}

/** Centred vertical logo — used on auth / landing pages */
export function LogoAuth({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <GlowMark className="h-14 w-14" />
      <div className="flex flex-col items-center leading-none gap-1.5">
        <span className="text-[10px] font-light tracking-[0.32em] uppercase text-muted-foreground select-none">
          Glow By
        </span>
        <span className="text-[22px] font-semibold tracking-[0.18em] uppercase select-none">Miral</span>
      </div>
    </div>
  );
}
