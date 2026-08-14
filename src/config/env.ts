export const env = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    secretKey: process.env.SUPABASE_SECRET_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    chatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  },
  ai: {
    dailyLimit: parseInt(process.env.AI_DAILY_LIMIT ?? "20", 10),
  },
} as const;
