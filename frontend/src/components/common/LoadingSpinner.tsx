import { cn } from "@/lib/utils";

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
