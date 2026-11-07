import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

const NAV_LINK = buttonVariants({ variant: 'ghost', className: 'font-semibold' });
const ACTIVE_NAV_LINK = {
  className: 'underline decoration-olympic-blue decoration-2 underline-offset-4',
};

// Les cinq couleurs olympiques en bande sous l'en-tête : les couleurs, pas l'emblème.
const OLYMPIC_BAND = [
  'bg-olympic-blue',
  'bg-olympic-yellow',
  'bg-olympic-black',
  'bg-olympic-green',
  'bg-olympic-red',
];

function RootLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 pt-4 sm:px-6 sm:pt-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-display text-3xl leading-none font-extrabold tracking-tight uppercase"
          >
            Dakar 2026
          </Link>
          <nav className="flex gap-1">
            <Link to="/chat" className={NAV_LINK} activeProps={ACTIVE_NAV_LINK}>
              Chatbot
            </Link>
          </nav>
        </div>
        <div aria-hidden="true" className="flex h-1">
          {OLYMPIC_BAND.map((color) => (
            <span key={color} className={`flex-1 origin-left ${color} motion-safe:animate-band`} />
          ))}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 pb-6">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link to="/" className={buttonVariants()}>
        Retour à l’accueil
      </Link>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });
