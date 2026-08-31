"use client";

export function OfflineScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6">
      <img src="/icons/icon-192.png" alt="Glow By Miral" className="w-16 h-16 rounded-2xl opacity-80" />
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 text-sm font-medium rounded-md border border-border bg-card hover:bg-accent transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
