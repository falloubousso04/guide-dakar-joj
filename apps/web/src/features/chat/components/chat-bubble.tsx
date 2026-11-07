import type { ReactNode } from 'react';

/** Bulle du supporter : noire, à droite, coin coupé en haut à gauche et pointe en bas à droite. */
export function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] bubble-user bg-primary px-4 pt-3 pb-6 text-primary-foreground">
        <p className="sr-only">Vous :</p>
        <p className="break-words whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

/** Bulle du chatbot : blanche bordée de bleu, à gauche, pointe en bas à gauche. */
export function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-start">
      {/* Le bord est une ombre portée sur le parent : une bordure CSS serait coupée par clip-path. */}
      <div className="max-w-[85%] bubble-outline">
        <div className="bubble-assistant bg-background px-4 pt-3 pb-6">{children}</div>
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
              className="size-2 rounded-full bg-olympic-blue motion-safe:animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span>Le chatbot écrit…</span>
      </div>
    </AssistantBubble>
  );
}

/** Un refus de l'API, en rouge : aucun lieu n'est proposé. */
export function ErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-start">
      <div
        role="alert"
        className="max-w-[85%] corner-cut border-l-[6px] border-l-olympic-red bg-olympic-red/10 px-4 py-3 pr-6 font-semibold"
      >
        {message}
      </div>
    </div>
  );
}
