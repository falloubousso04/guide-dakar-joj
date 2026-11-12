import { createFileRoute, redirect } from '@tanstack/react-router';

// Le produit, c'est le chatbot : la page d'accueil y mène directement.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/chat' });
  },
});
