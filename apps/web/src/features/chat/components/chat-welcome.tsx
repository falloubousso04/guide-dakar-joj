import { AssistantBubble } from './chat-bubble';

const EXAMPLES = [
  'Je suis à Diamniadio, mon match est à 17 h',
  'Je suis à Dakar, il est 10 h, mon épreuve est à 15 h 30',
  'Je loge à Saly, ma finale commence à 18 h',
];

/** L'accueil, avant le premier message : ce que le chatbot attend, et des exemples à cliquer. */
export function ChatWelcome({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <AssistantBubble>
        <p>
          Bonjour ! Dites-moi où vous êtes (Dakar, Diamniadio ou Saly) et l’heure de votre épreuve :
          je vous propose des lieux à visiter en revenant à temps.
        </p>
      </AssistantBubble>
      <section aria-labelledby="chat-examples" className="flex flex-col gap-3">
        <h2 id="chat-examples" className="font-display text-lg font-bold tracking-wide uppercase">
          Essayez par exemple
        </h2>
        <ul className="flex flex-col gap-2">
          {EXAMPLES.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => onPick(question)}
                className="flex w-full corner-cut items-center gap-3 border-2 border-foreground px-4 py-3 pr-6 text-left transition-colors outline-none hover:bg-olympic-yellow/20 focus-visible:bg-olympic-yellow/20 focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <span aria-hidden="true" className="size-2.5 shrink-0 bg-olympic-yellow" />
                {question}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
