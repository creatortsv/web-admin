// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BotsFleetPage from '../../src/app/bots/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  SKELETON_CLASS,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { botWire } from '../support/adminWireFixtures';

describe('bots page (/v1/admin/bots)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bots loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<BotsFleetPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Active Cluster Bots'),
      data: container.innerHTML.includes('BTCUSDT'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('bots error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/admin/bots': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<BotsFleetPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Active Cluster Bots'),
      data: container.innerHTML.includes('BTCUSDT'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Fleet bots could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('bots empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/bots': { status: 200, body: { bots: [] } } });

    const { container } = render(<BotsFleetPage />);
    await screen.findByText('No Active Cluster Bots');

    expect({
      emptyState: container.innerHTML.includes('No Active Cluster Bots'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: true, alerts: 0 });
  });

  it('bots data: the fixture is rendered without an empty state and without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/bots': { status: 200, body: { bots: [botWire] } } });

    const { container } = render(<BotsFleetPage />);
    await screen.findByText('BTCUSDT');

    expect({
      data: container.innerHTML.includes('BTCUSDT'),
      emptyState: container.innerHTML.includes('No Active Cluster Bots'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ data: true, emptyState: false, alerts: 0 });
  });
});
