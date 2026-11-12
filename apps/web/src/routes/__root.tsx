import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { ChatIcon, InfoIcon } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';

// Les onglets de l'application : en bas de l'écran sur téléphone, dans la barre du haut sur ordinateur.
const TABS = [
  { to: '/chat', label: 'Chatbot', Icon: ChatIcon },
  { to: '/comment-ca-marche', label: 'Comment ça marche', Icon: InfoIcon },
] as const;

// Les cinq couleurs olympiques en bande sous la barre : les couleurs, pas l'emblème.
const OLYMPIC_BAND = [
  'bg-olympic-blue',
  'bg-olympic-yellow',
  'bg-olympic-black',
  'bg-olympic-green',
  'bg-olympic-red',
];

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-joj-green-deep/95 text-white shadow-lg backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-joj-lime"
          >
            <span
              aria-hidden="true"
              className="grid size-10 corner-cut place-items-center bg-joj-lime font-display text-xl font-extrabold text-joj-green-deep"
            >
              26
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-extrabold tracking-tight uppercase">
                Dakar 2026
              </span>
              <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-joj-lime uppercase">
                Guide des supporters
              </span>
            </span>
          </Link>
          <nav
            aria-label="Navigation principale"
            className="fixed inset-x-0 bottom-0 z-30 flex border-t border-black/10 bg-background pb-[env(safe-area-inset-bottom)] text-foreground shadow-[0_-8px_24px_rgb(0_0_0/0.08)] sm:static sm:gap-1 sm:border-0 sm:bg-transparent sm:pb-0 sm:text-white sm:shadow-none"
          >
            {TABS.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:flex-none sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:text-sm"
                activeProps={{ className: 'text-joj-green sm:bg-white/15 sm:text-white' }}
                inactiveProps={{
                  className:
                    'text-muted-foreground hover:text-foreground sm:text-white/80 sm:hover:text-white',
                }}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div aria-hidden="true" className="flex h-1">
          {OLYMPIC_BAND.map((color) => (
            <span key={color} className={`flex-1 origin-left ${color} motion-safe:animate-band`} />
          ))}
        </div>
      </header>
      {/* Sur téléphone, la marge basse laisse la place aux onglets fixés en bas. */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
        <div className="flex flex-1 flex-col gap-6 bg-background px-4 pt-5 pb-6 text-foreground shadow-2xl sm:corner-cut sm:px-8 sm:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-display text-3xl font-extrabold uppercase">Page introuvable</h1>
      <Link to="/" className={buttonVariants()}>
        Retour au chatbot
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
