/**
 * L'entrée de l'application : la page d'accueil ouvre le chatbot, et le menu y mène.
 * Le module Disciplines reste dans le code, mais n'est plus proposé dans l'interface.
 */
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/utils';

describe('home and menu', () => {
  it('001-AS10: the home page opens the chatbot', async () => {
    const { router } = await renderRoute({ initialEntries: ['/'] });

    expect(await screen.findByLabelText('Votre message')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/chat');
  });

  it('001-AS10: the menu leads to the chatbot, not to the disciplines', async () => {
    await renderRoute({ initialEntries: ['/chat'] });

    const menu = await screen.findByRole('navigation');
    expect(within(menu).getByRole('link', { name: 'Chatbot' })).toHaveAttribute('href', '/chat');
    expect(within(menu).queryByRole('link', { name: /disciplines/i })).not.toBeInTheDocument();
  });
});
