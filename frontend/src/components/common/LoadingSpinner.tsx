import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/common/Logo";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent", className)}
    />
  );
}

export function PageLoading() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}

export function DashboardLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <LogoIcon className="h-14 w-14 animate-pulse" />
        <div className="flex flex-col items-center gap-1.5 leading-none">
          <span className="select-none text-[10px] font-light tracking-[0.32em] uppercase text-muted-foreground">
            Glow By
          </span>
          <span className="select-none text-[20px] font-semibold tracking-[0.18em] uppercase">Miral</span>
        </div>
      </div>
    </div>
  );
}
