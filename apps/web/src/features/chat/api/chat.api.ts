import { type ChatRequest, type ChatResponse, chatResponseSchema } from '@joj/shared';
import { createApiClient } from '@/lib/api';

// Chaque message appelle Claude deux fois (comprendre, puis rédiger) : la réponse peut prendre
// bien plus que les 10 s du client par défaut.
const CHAT_TIMEOUT_MS = 60_000;

const chatClient = createApiClient({ baseUrl: '/api', timeoutMs: CHAT_TIMEOUT_MS });

/** L'appel HTTP du chatbot, réponse validée par le schéma partagé. */
export const chatApi = {
  send: (input: ChatRequest) =>
    chatClient.request<ChatResponse>('/chat', {
      method: 'POST',
      body: input,
      schema: chatResponseSchema,
    }),
};
