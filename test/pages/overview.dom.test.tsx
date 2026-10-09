// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewPage from '../../src/app/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { SKELETON_CLASS } from '../support/skeleton';
import { statsWire } from '../support/adminWireFixtures';

describe('overview page (/v1/admin/stats)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('overview loading: a never-answered request shows the skeleton and no figures', () => {
    stubBackendNeverAnswers();

    const { container } = render(<OverviewPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      figures: container.innerHTML.includes('Bots reported running by the backend'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, figures: false, alerts: 0 });
  });

  it('overview error: 403 admin_routes_disabled is shown in an alert and no figures', async () => {
    stubBackendRoutes({ 'GET /v1/admin/stats': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<OverviewPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      figures: container.innerHTML.includes('Bots reported running by the backend'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Platform telemetry could not be loaded403 admin_routes_disabled'],
      figures: false,
      skeleton: false,
    });
  });

  // The overview has no backend-empty state: its only InstitutionalEmptyState is the permanent
  // service-health notice. This case proves that notice is shown next to answered stats, no more.
  it('overview service-health notice: shown with an answered stats response and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/stats': { status: 200, body: statsWire } });

    const { container } = render(<OverviewPage />);
    await screen.findByText('Bots reported running by the backend');

    expect({
      notice: container.innerHTML.includes('Service health is not available in the admin console'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ notice: true, alerts: 0 });
  });

  it('overview data: the stats of the fixture are rendered without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/stats': { status: 200, body: statsWire } });

    const { container } = render(<OverviewPage />);
    await screen.findByText('$1,500.5');

    expect({
      pendingSweep: container.innerHTML.includes('$20'),
      kafkaLag: container.innerHTML.includes('0 msgs'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ pendingSweep: true, kafkaLag: true, alerts: 0 });
  });
});
