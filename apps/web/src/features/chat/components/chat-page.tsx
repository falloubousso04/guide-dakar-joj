import { chatMessageSchema } from '@joj/shared';
import { useEffect, useState } from 'react';
import { useSendChatMessage } from '../api/chat.queries';
import { ErrorBubble, TypingIndicator } from './chat-bubble';
import { ChatConversation, type ConversationEntry } from './chat-conversation';
import { ChatInput } from './chat-input';
import { ChatWelcome } from './chat-welcome';
import { chatErrorMessage } from './error-message';

export function ChatPage() {
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const sendMessage = useSendChatMessage();

  // Le dernier message, l'indicateur ou l'erreur restent visibles au-dessus de la zone de saisie.
  useEffect(() => {
    if (entries.length > 0) window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [entries.length, sendMessage.isPending, sendMessage.isError]);

  function send(text: string): boolean {
    if (sendMessage.isPending) return false;
    // Même schéma que l'API : un message vide ou fait d'espaces ne part pas.
    const parsed = chatMessageSchema.safeParse({ role: 'user', content: text });
    if (!parsed.success) return false;

    const conversation: ConversationEntry[] = [
      ...entries,
      { role: 'user', content: parsed.data.content },
    ];
    setEntries(conversation);
    // Pas de mémoire côté serveur : toute la conversation part avec chaque message.
    sendMessage.mutate(
      { messages: conversation.map(({ role, content }) => ({ role, content })) },
      {
        onSuccess: ({ reply, places }) =>
          setEntries((current) => [...current, { role: 'assistant', content: reply, places }]),
      },
    );
    return true;
  }

  return (
    // `-mb-6` annule la marge basse de <main> : la zone de saisie colle au bas de l'écran.
    <div className="-mb-6 flex flex-1 flex-col gap-6">
      <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
        Que faire avant votre épreuve ?
      </h1>
      {entries.length === 0 && <ChatWelcome onPick={send} />}
      <div className="flex flex-1 flex-col gap-4">
        <ChatConversation entries={entries} />
        {sendMessage.isPending && <TypingIndicator />}
        {sendMessage.isError && <ErrorBubble message={chatErrorMessage(sendMessage.error)} />}
      </div>
      <ChatInput onSend={send} pending={sendMessage.isPending} />
    </div>
  );
}
