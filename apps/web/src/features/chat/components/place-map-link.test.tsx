import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlaceMapLink } from './place-map-link';

describe('PlaceMapLink', () => {
  it('002-AS2: links to the maps app on the exact place, in a new tab', () => {
    render(<PlaceMapLink location={{ latitude: 14.6937, longitude: -17.4441 }} />);

    const link = screen.getByRole('link', { name: /Voir sur la carte/ });
    expect(link).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=14.6937,-17.4441',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('002-AS3: shows nothing when the location is unknown', () => {
    const { container } = render(<PlaceMapLink location={null} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });
});
