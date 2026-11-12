import { PinIcon } from '@/components/icons';
import { AssistantBubble } from './chat-bubble';

// Un exemple par site olympique, chacun avec sa couleur.
const EXAMPLES = [
  { question: 'Je suis à Diamniadio, mon match est à 17 h', color: 'text-olympic-blue' },
  { question: 'Je suis à Dakar, il est 10 h, mon épreuve est à 15 h 30', color: 'text-joj-green' },
  { question: 'Je loge à Saly, ma finale commence à 18 h', color: 'text-olympic-red' },
];

/** L'accueil, avant le premier message : ce que le chatbot attend, et des exemples à toucher. */
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
        <h2
          id="chat-examples"
          className="font-display text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase"
        >
          Essayez par exemple
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {EXAMPLES.map(({ question, color }, index) => (
            <li
              key={question}
              className="motion-safe:animate-fade-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <button
                type="button"
                onClick={() => onPick(question)}
                className="flex h-full w-full items-start gap-3 rounded-2xl border border-black/10 bg-background p-4 text-left shadow-sm transition outline-none hover:-translate-y-0.5 hover:border-joj-green hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <PinIcon className={`mt-0.5 size-5 shrink-0 ${color}`} />
                {question}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
