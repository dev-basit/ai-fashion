import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { env } from "@/config/env";

export const llm = new ChatOpenAI({
  model: env.openai.chatModel,
  apiKey: env.openai.apiKey,
  streaming: true,
});

export const embeddings = new OpenAIEmbeddings({
  model: env.openai.embeddingModel,
  apiKey: env.openai.apiKey,
});
