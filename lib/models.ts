import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral, mistral } from "@ai-sdk/mistral";
import { createOllama } from "ollama-ai-provider";

export type LLMModel = {
  id: string;
  name: string;
  provider: string;
  providerId: string;
};

export type LLMModelConfig = {
  model?: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens?: number;
};

export function getModelClient(model: LLMModel, config: LLMModelConfig) {
  const { id: modelNameString, providerId } = model;

  const { apiKey, baseURL } = config;

  const providerConfigs = {
    anthropic: () => createAnthropic({ apiKey, baseURL })(modelNameString),
    openai: () => createOpenAI({ apiKey, baseURL })(modelNameString),
    google: () =>
      createGoogleGenerativeAI({ apiKey, baseURL })(modelNameString),
    mistral: () => createMistral({ apiKey, baseURL })(modelNameString),
    groq: () =>
      createOpenAI({
        apiKey: apiKey || process.env.GROQ_API_KEY,
        baseURL: baseURL || "https://api/groq.com/openai/v1",
      })(modelNameString),
    togetherai: () =>
      createOpenAI({
        apiKey: apiKey || process.env.TOGETHER_AI_API_KEY,
        baseURL: baseURL || "https://api.together.xyz/v1",
      })(modelNameString),
    fireworks: () =>
      createOpenAI({
        apiKey: apiKey || process.env.FIREWORKS_API_KEY,
        baseURL: baseURL || "https://api.fireworks.ai/inference/v1",
      })(modelNameString),
    ollama: () => createOllama({ baseURL })(modelNameString),
  };

  const createClient =
    providerConfigs[providerId as keyof typeof providerConfigs];

  if (!createClient) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }

  return createClient();
}

export function getDefaultMode(model: LLMModel) {
  const { id: modelNameString, providerId } = model;

  if (providerId === "fireworks") {
    return "json";
  }

  return "auto";
}
