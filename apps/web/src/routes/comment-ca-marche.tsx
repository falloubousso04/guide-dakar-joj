import { createFileRoute, Link } from '@tanstack/react-router';
import { ChatIcon, CheckIcon, ClockIcon, RouteIcon } from '@/components/icons';
import { GuideMascot } from '@/features/chat/components/guide-mascot';

// La promesse du produit : une seule règle, appliquée par l'application et non par l'IA.
const RULE = ['Aller', 'Visite', 'Retour'];

const STEPS = [
  {
    title: 'Vous écrivez',
    text: 'Où vous êtes et l’heure de votre épreuve, comme vous le diriez à un habitant.',
    Icon: ChatIcon,
    color: 'bg-olympic-blue',
  },
  {
    title: 'La règle choisit',
    text: 'Seulement les lieux où l’aller, la visite et le retour tiennent avant l’épreuve.',
    Icon: ClockIcon,
    color: 'bg-joj-green',
  },
  {
    title: 'Le guide répond',
    text: 'Une réponse en français et une carte par lieu, avec votre heure de retour.',
    Icon: RouteIcon,
    color: 'bg-olympic-red',
  },
];

function HowItWorks() {
  return (
    <div className="flex flex-col gap-10">
      <section className="joj-hero relative flex items-center gap-4 overflow-hidden px-5 py-8 text-white motion-safe:animate-fade-up sm:px-8">
        <div className="flex flex-1 flex-col gap-3">
          <p className="font-display text-sm font-bold tracking-[0.2em] text-joj-lime uppercase">
            Comment ça marche
          </p>
          <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
            Ne jamais rater votre épreuve
          </h1>
          <p className="max-w-prose text-white/90">
            Entre deux épreuves, le guide vous dit quoi visiter à Dakar, et seulement ce qui vous
            ramène à temps.
          </p>
        </div>
        <GuideMascot className="hidden size-40 shrink-0 sm:block" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1.5 bg-joj-lime" />
      </section>

      <section aria-labelledby="rule" className="flex flex-col items-center gap-4 text-center">
        <h2
          id="rule"
          className="font-display text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase"
        >
          Notre promesse
        </h2>
        <p className="flex flex-wrap items-center justify-center gap-2 font-display text-2xl font-extrabold uppercase sm:text-3xl">
          {RULE.map((word, index) => (
            <span key={word} className="flex items-center gap-2">
              <span className="rounded-xl border border-black/10 bg-muted px-4 py-2">{word}</span>
              <span aria-hidden="true">{index < RULE.length - 1 ? '+' : '≤'}</span>
            </span>
          ))}
          <span className="rounded-xl bg-joj-green px-4 py-2 text-white">Épreuve</span>
        </p>
      </section>

      <section aria-labelledby="steps" className="flex flex-col gap-4">
        <h2
          id="steps"
          className="font-display text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase"
        >
          En trois étapes
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ title, text, Icon, color }, index) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-background p-5 shadow-md motion-safe:animate-fade-up"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className={`grid size-11 place-items-center rounded-full text-white ${color}`}>
                <Icon className="size-5" />
              </span>
              <h3 className="font-display text-2xl leading-none font-extrabold uppercase">
                {index + 1}. {title}
              </h3>
              <p className="text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <CheckIcon className="size-4 text-joj-green" />
        L’IA comprend et répond ; elle ne choisit jamais les lieux.
      </p>

      <Link
        to="/chat"
        className="self-center rounded-full bg-joj-green px-6 py-3 font-display text-lg font-bold tracking-wide text-white uppercase shadow-md transition outline-none hover:bg-joj-green-deep focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        Essayer le chatbot
      </Link>
    </div>
  );
}

export const Route = createFileRoute('/comment-ca-marche')({ component: HowItWorks });
