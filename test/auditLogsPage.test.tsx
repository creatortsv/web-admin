import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import AuditLogsPage from '../src/app/audit-logs/page';

describe('audit log page', () => {
  it('audit log page shows no invented entries', () => {
    const html = renderToStaticMarkup(<AuditLogsPage />);
    expect(html).not.toContain('log_0');
    expect(html).not.toContain('BOOTSTRAP_SUPERADMIN_TOTP');
    expect(html).not.toContain('security-admin@venom.finance');
    expect(html).not.toContain('Chain Integrity Valid');
    expect(html).toContain('Audit listings are not available yet');
  });
});
