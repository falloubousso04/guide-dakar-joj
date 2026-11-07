import { useMutation } from '@tanstack/react-query';
import { chatApi } from './chat.api';

/**
 * Envoie la conversation au chatbot. Rien n'est mis en cache : chaque réponse dépend de toute la
 * conversation, que l'écran garde et renvoie à chaque message.
 */
export const useSendChatMessage = () => useMutation({ mutationFn: chatApi.send });
