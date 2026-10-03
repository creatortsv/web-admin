import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import OverviewPage from '../src/app/page';

describe('overview page', () => {
  it('dashboard shows no invented health', () => {
    const html = renderToStaticMarkup(<OverviewPage />);
    expect(html).not.toContain('HEALTHY');
    expect(html).not.toContain('12/12 Operational');
    expect(html).not.toContain('Across 18 user nodes');
    expect(html).not.toContain('10 Go microservices');
    expect(html).toContain('Service health is not available in the admin console');
  });
});
