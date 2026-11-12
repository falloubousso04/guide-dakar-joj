/** La page « Comment ça marche » : la promesse, les trois étapes, et un audit axe-core. */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeFindings, runAxe } from '@/test/axe';
import { renderRoute } from '@/test/utils';

describe('how it works page', () => {
  it('001-AS10: explains the promise in three steps and leads to the chatbot', async () => {
    await renderRoute({ initialEntries: ['/comment-ca-marche'] });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ne jamais rater votre épreuve' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Essayer le chatbot' })).toHaveAttribute(
      'href',
      '/chat',
    );
  });

  it('001-AS10: the page is clean', async () => {
    await renderRoute({ initialEntries: ['/comment-ca-marche'] });
    await screen.findByRole('heading', { level: 1 });
    expect(axeFindings(await runAxe())).toEqual([]);
  });
});
