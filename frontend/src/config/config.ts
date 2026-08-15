export const env = {
  app: {
    backend_url: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  },
} as const;
