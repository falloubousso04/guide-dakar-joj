import { chatMessageSchema } from '@joj/shared';
import { useEffect, useState } from 'react';
import { useSendChatMessage } from '../api/chat.queries';
import { ErrorBubble, TypingIndicator } from './chat-bubble';
import { ChatConversation, type ConversationEntry } from './chat-conversation';
import { ChatInput } from './chat-input';
import { ChatWelcome } from './chat-welcome';
import { GuideMascot } from './guide-mascot';
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
      <section className="joj-hero relative flex items-center gap-4 overflow-hidden px-5 py-6 text-white motion-safe:animate-fade-up sm:px-8">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-display text-sm font-bold tracking-[0.2em] text-joj-lime uppercase">
            Ton guide de Dakar
          </p>
          <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
            Que faire avant votre épreuve ?
          </h1>
        </div>
        <GuideMascot className="size-36 shrink-0 sm:size-56" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-joj-lime" />
      </section>
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
