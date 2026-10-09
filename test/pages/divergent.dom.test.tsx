// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DivergentOrdersPage from '../../src/app/orders/divergent/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { SKELETON_CLASS } from '../support/skeleton';
import { orderWire } from '../support/adminWireFixtures';

describe('divergent orders page (/v1/trading/admin/divergent-orders)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('divergent orders loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<DivergentOrdersPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Divergent Orders Reported'),
      data: container.innerHTML.includes('client-1'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('divergent orders error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/trading/admin/divergent-orders': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<DivergentOrdersPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Divergent Orders Reported'),
      data: container.innerHTML.includes('client-1'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Divergent orders could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('divergent orders empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/trading/admin/divergent-orders': { status: 200, body: {} } });

    const { container } = render(<DivergentOrdersPage />);
    await screen.findByText('No Divergent Orders Reported');

    expect({ alerts: screen.queryAllByRole('alert').length }).toStrictEqual({ alerts: 0 });
  });

  it('divergent orders data: the fixture is rendered without an empty state and without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/trading/admin/divergent-orders': { status: 200, body: { orders: [orderWire] } } });

    const { container } = render(<DivergentOrdersPage />);
    await screen.findByText('client-1');

    expect({
      emptyState: container.innerHTML.includes('No Divergent Orders Reported'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: false, alerts: 0 });
  });

  it('divergent orders rejected sync: 403 admin_routes_disabled is shown, no refetch and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = stubBackendRoutes({
      'GET /v1/trading/admin/divergent-orders': { status: 200, body: { orders: [orderWire] } },
      'POST /v1/trading/admin/divergent-orders/ord-1/sync': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<DivergentOrdersPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Query & Sync' }));
    const banner = await screen.findByText('Sync failed: 403 admin_routes_disabled');

    expect({
      failureText: banner.textContent,
      errorVariant: banner.closest('[class*="text-rose-300"]') !== null,
      successVariant: banner.closest('[class*="text-emerald-300"]') !== null,
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      failureText: 'Sync failed: 403 admin_routes_disabled',
      errorVariant: true,
      successVariant: false,
      requests: 2,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('divergent orders rejected force cancel: 403 admin_routes_disabled is shown, no refetch and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = stubBackendRoutes({
      'GET /v1/trading/admin/divergent-orders': { status: 200, body: { orders: [orderWire] } },
      'POST /v1/trading/admin/divergent-orders/ord-1/cancel': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<DivergentOrdersPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Force Cancel' }));
    const banner = await screen.findByText('Cancellation failed: 403 admin_routes_disabled');

    expect({
      failureText: banner.textContent,
      errorVariant: banner.closest('[class*="text-rose-300"]') !== null,
      successVariant: banner.closest('[class*="text-emerald-300"]') !== null,
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      failureText: 'Cancellation failed: 403 admin_routes_disabled',
      errorVariant: true,
      successVariant: false,
      requests: 2,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('divergent orders rejected abandon: 403 admin_routes_disabled is shown, no refetch and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = stubBackendRoutes({
      'GET /v1/trading/admin/divergent-orders': { status: 200, body: { orders: [orderWire] } },
      'POST /v1/trading/admin/divergent-orders/ord-1/abandon': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<DivergentOrdersPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Abandon' }));
    const banner = await screen.findByText('Abandon action failed: 403 admin_routes_disabled');

    expect({
      failureText: banner.textContent,
      errorVariant: banner.closest('[class*="text-rose-300"]') !== null,
      successVariant: banner.closest('[class*="text-emerald-300"]') !== null,
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      failureText: 'Abandon action failed: 403 admin_routes_disabled',
      errorVariant: true,
      successVariant: false,
      requests: 2,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });
});
