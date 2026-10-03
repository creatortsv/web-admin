import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '@creatortsv/pkg-ui';
import OverviewPage from '../src/app/page';
import BotsFleetPage from '../src/app/bots/page';
import UsersPage from '../src/app/users/page';
import PaymentsPage from '../src/app/payments/page';
import TreasuryPage from '../src/app/treasury/page';
import DivergentOrdersPage from '../src/app/orders/divergent/page';
import CompensationClaimsPage from '../src/app/billing/compensations/page';
import BrokerRebatesPage from '../src/app/settings/broker-rebates/page';

/**
 * `renderToStaticMarkup` renders the first frame only: effects have not run, so the backend has
 * not answered. That frame must be the loading state, never an empty state or invented data.
 * [Policy Ref: Contract §5.10 - four UI states, no fallback mocks]
 */
const SKELETON_CLASS = /class="([^"]+)"/.exec(renderToStaticMarkup(<Skeleton />))?.[1]?.split(' ')[0];

interface PageCase {
  readonly name: string;
  readonly render: () => ReactElement;
  /** Texts that the pages rendered from invented data or from a premature empty state. */
  readonly invented: readonly string[];
}

const pages: readonly PageCase[] = [
  {
    name: 'overview',
    render: () => <OverviewPage />,
    invented: ['HEALTHY', '12/12 Operational', 'Across 18 user nodes', '10 Go microservices'],
  },
  {
    name: 'bots',
    render: () => <BotsFleetPage />,
    invented: ['No Active Cluster Bots', 'SUPERVISOR IDLE'],
  },
  {
    name: 'users',
    render: () => <UsersPage />,
    invented: ['No registered user accounts found'],
  },
  {
    name: 'payments',
    render: () => <PaymentsPage />,
    invented: ['price_starter_123', 'whsec_mock', 'mock_secret', 'Config State: DISABLED', 'None configured'],
  },
  {
    name: 'treasury',
    render: () => <TreasuryPage />,
    invented: ['No Treasury Vaults Configured', 'COLD STORAGE VAULTS'],
  },
  {
    name: 'orders/divergent',
    render: () => <DivergentOrdersPage />,
    invented: ['Multi-Exchange Sweeper', 'Zero Divergent Orders Detected', 'LEDGER RECONCILED'],
  },
  {
    name: 'billing/compensations',
    render: () => <CompensationClaimsPage />,
    invented: ['No Pending Approvals', 'AUDIT COMPLIANT', '$0.00 USD'],
  },
  {
    name: 'settings/broker-rebates',
    render: () => <BrokerRebatesPage />,
    invented: ['30.0% Rebate', '34.118.24.10', '34.118.24.11'],
  },
];

describe('the eight admin pages render the loading state before the backend answers', () => {
  it('knows the pkg-ui Skeleton marker', () => {
    expect(SKELETON_CLASS).toBeTruthy();
  });

  it.each(pages)('$name renders a Skeleton', ({ render }) => {
    expect(renderToStaticMarkup(render())).toContain(`class="${SKELETON_CLASS}`);
  });

  it.each(pages.flatMap((p) => p.invented.map((text) => [p.name, text, p.render] as const)))(
    '%s renders no invented text: %s',
    (_name, text, render) => {
      expect(renderToStaticMarkup(render())).not.toContain(text);
    },
  );
});
