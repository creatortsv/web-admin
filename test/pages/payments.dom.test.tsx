// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PaymentsPage from '../../src/app/payments/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  SKELETON_CLASS,
  stubBackendNeverAnswers,
  stubBackendRoutes,
  universalGatewayConfigWire,
  universalGatewayWire,
} from '../support/adminBackend';

describe('payments page (/v1/billing/gateways)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('payments loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<PaymentsPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Payment Gateways Registered'),
      data: container.innerHTML.includes('sk_test_***1234'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('payments error: 403 admin_routes_disabled is shown in alerts, no empty state and no data', async () => {
    stubBackendRoutes({
      'GET /v1/billing/gateways': ANSWER_ADMIN_ROUTES_DISABLED,
      'GET /v1/billing/gateways/stripe/config?environment=TEST': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<PaymentsPage />);
    await screen.findByText('Gateway configuration could not be loaded');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Payment Gateways Registered'),
      data: container.innerHTML.includes('sk_test_***1234'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: [
        'Payment gateways could not be loaded403 admin_routes_disabled',
        'Gateway configuration could not be loaded403 admin_routes_disabled',
      ],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('payments empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({
      'GET /v1/billing/gateways': { status: 200, body: { gateways: [] } },
      'GET /v1/billing/gateways/stripe/config?environment=TEST': {
        status: 200,
        body: { config: universalGatewayConfigWire },
      },
    });

    const { container } = render(<PaymentsPage />);
    await screen.findByText('No Payment Gateways Registered');

    expect({
      emptyState: container.innerHTML.includes('No Payment Gateways Registered'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: true, alerts: 0 });
  });

  it('payments data: the gateway and its configuration are rendered without an alert', async () => {
    stubBackendRoutes({
      'GET /v1/billing/gateways': { status: 200, body: { gateways: [universalGatewayWire] } },
      'GET /v1/billing/gateways/stripe/config?environment=TEST': {
        status: 200,
        body: { config: universalGatewayConfigWire },
      },
    });

    const { container } = render(<PaymentsPage />);
    await screen.findByText('sk_test_***1234');

    expect({
      gateway: container.innerHTML.includes('Stripe'),
      maskedSecretKey: container.innerHTML.includes('sk_test_***1234'),
      emptyState: container.innerHTML.includes('No Payment Gateways Registered'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ gateway: true, maskedSecretKey: true, emptyState: false, alerts: 0 });
  });

  it('payments rejected gateway toggle: 403 admin_routes_disabled is shown and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    stubBackendRoutes({
      'GET /v1/billing/gateways': { status: 200, body: { gateways: [universalGatewayWire] } },
      'GET /v1/billing/gateways/stripe/config?environment=TEST': {
        status: 200,
        body: { config: universalGatewayConfigWire },
      },
      'PUT /v1/billing/gateways/stripe/config': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<PaymentsPage />);
    await screen.findByText('ON');
    const toggle = (await screen.findByText('ENABLED')).previousElementSibling!;
    fireEvent.click(toggle);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      stateAfterFailure: container.innerHTML.includes('ENABLED'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alerts: ['Payment gateway action failedGateway stripe was not updated: 403 admin_routes_disabled'],
      stateAfterFailure: true,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('payments rejected credential rotation: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    stubBackendRoutes({
      'GET /v1/billing/gateways': { status: 200, body: { gateways: [universalGatewayWire] } },
      'GET /v1/billing/gateways/stripe/config?environment=TEST': {
        status: 200,
        body: { config: universalGatewayConfigWire },
      },
      'PUT /v1/billing/gateways/stripe/config': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<PaymentsPage />);
    await screen.findByText('sk_test_***1234');
    fireEvent.change(screen.getByPlaceholderText('sk_test_...'), { target: { value: 'some secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rotate & Seal (Cloud KMS DEK)' }));
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      successText: container.innerHTML.includes('Credentials Sealed & Rotated'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alerts: ['Payment gateway action failedCredentials were not rotated: 403 admin_routes_disabled'],
      successText: false,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('payments rejected connection test: 403 admin_routes_disabled is shown and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    stubBackendRoutes({
      'GET /v1/billing/gateways': { status: 200, body: { gateways: [universalGatewayWire] } },
      'GET /v1/billing/gateways/stripe/config?environment=TEST': {
        status: 200,
        body: { config: universalGatewayConfigWire },
      },
      'POST /v1/billing/gateways/stripe/test': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<PaymentsPage />);
    await screen.findByText('sk_test_***1234');
    fireEvent.click(screen.getByRole('button', { name: 'Test Connection' }));
    const failure = await screen.findByText('403 admin_routes_disabled');

    expect({
      failureText: failure.textContent,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: '403 admin_routes_disabled', localStorageLength: 0, setItemCalls: 0 });
  });
});
