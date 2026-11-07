import { z } from 'zod';
import { placeSuggestionSchema } from './places.ts';

export const CHAT_MESSAGE_MAX_LENGTH = 1000;
export const CHAT_MAX_MESSAGES = 20;

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(CHAT_MESSAGE_MAX_LENGTH),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** Corps de `POST /api/chat` : toute la conversation, renvoyée à chaque message (pas de mémoire côté serveur). */
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(CHAT_MAX_MESSAGES),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Ce que le chatbot doit encore demander au supporter. */
export const missingInfoSchema = z.enum(['site', 'eventTime']);
export type MissingInfo = z.infer<typeof missingInfoSchema>;

/** Réponse de `POST /api/chat`. */
export const chatResponseSchema = z.object({
  /** Le texte du chatbot, rédigé par Claude. */
  reply: z.string(),
  /** Les lieux choisis par la règle de temps, affichés en cartes par l'écran. */
  places: z.array(placeSuggestionSchema),
  missing: z.array(missingInfoSchema),
});
export type ChatResponse = z.infer<typeof chatResponseSchema>;
