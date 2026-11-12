import type { ReactNode } from 'react';
import { AlertIcon } from '@/components/icons';
import { GuideAvatar } from './guide-mascot';

/** Bulle du supporter : noire, à droite, comme dans une messagerie. */
export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end motion-safe:animate-fade-up">
      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-3 text-background shadow-md">
        <p className="sr-only">Vous :</p>
        <p className="break-words whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

/** Bulle du chatbot : blanche, à gauche, avec le portrait du guide. */
export function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-end gap-2 motion-safe:animate-fade-up">
      <GuideAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-black/10 bg-background px-4 py-3 shadow-sm">
        {children}
      </div>
    </div>
  );
}

/** « Le chatbot écrit… », pendant que l'API répond. */
export function TypingIndicator() {
  return (
    <AssistantBubble>
      <div role="status" className="flex items-center gap-3">
        <span aria-hidden="true" className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 rounded-full bg-joj-green motion-safe:animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">Le chatbot écrit…</span>
      </div>
    </AssistantBubble>
  );
}

/** Un refus de l'API, en rouge : aucun lieu n'est proposé. */
export function ErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-start motion-safe:animate-fade-up">
      <div
        role="alert"
        className="flex max-w-[85%] items-start gap-3 rounded-2xl border border-olympic-red/40 bg-olympic-red/10 px-4 py-3 font-semibold"
      >
        <AlertIcon className="mt-0.5 size-5 shrink-0 text-olympic-red" />
        <span>{message}</span>
      </div>
    </div>
  );
}
