// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BrokerRebatesPage from '../../src/app/settings/broker-rebates/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { SKELETON_CLASS } from '../support/skeleton';
import { brokerConfigWire } from '../support/adminWireFixtures';

describe('broker rebates page (/v1/admin/broker-configs)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('broker rebates loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<BrokerRebatesPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Broker Configuration Stored'),
      data: container.innerHTML.includes('12.5% Rebate'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('broker rebates error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/admin/broker-configs?include_inactive=true': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<BrokerRebatesPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Broker Configuration Stored'),
      data: container.innerHTML.includes('12.5% Rebate'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Broker configurations could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('broker rebates empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: {} },
    });

    const { container } = render(<BrokerRebatesPage />);
    await screen.findByText('No Broker Configuration Stored');

    expect({ alerts: screen.queryAllByRole('alert').length }).toStrictEqual({ alerts: 0 });
  });

  it('broker rebates data: the stored configuration is rendered without an empty state and an alert', async () => {
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: { configs: [brokerConfigWire] } },
    });

    const { container } = render(<BrokerRebatesPage />);
    await screen.findByText('12.5% Rebate');

    expect({
      emptyState: container.innerHTML.includes('No Broker Configuration Stored'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: false, alerts: 0 });
  });

  it('broker rebates rejected lifecycle change: 403 admin_routes_disabled is shown and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const alertDialog = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: { configs: [brokerConfigWire] } },
      'PUT /v1/admin/broker-configs/bingx': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<BrokerRebatesPage />);
    await screen.findByText('12.5% Rebate');
    fireEvent.change(screen.getByLabelText(/Change reason/), { target: { value: 'some reason' } });
    fireEvent.click(screen.getByRole('button', { name: 'RESTRICTED' }));
    await waitFor(() => expect(alertDialog).toHaveBeenCalled());

    expect({
      alertMessages: alertDialog.mock.calls.map((call) => call[0]),
      activeStageHighlighted: screen.getByRole('button', { name: 'ACTIVE' }).className.includes('bg-emerald-500/20'),
      restrictedStageHighlighted: screen.getByRole('button', { name: 'RESTRICTED' }).className.includes('bg-amber-500/20'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alertMessages: ['403 admin_routes_disabled'],
      activeStageHighlighted: true,
      restrictedStageHighlighted: false,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('broker rebates rejected seal and commit: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const alertDialog = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: { configs: [brokerConfigWire] } },
      'PUT /v1/admin/broker-configs/bingx': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<BrokerRebatesPage />);
    await screen.findByText('12.5% Rebate');
    fireEvent.change(screen.getByLabelText(/Change reason/), { target: { value: 'some reason' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. BX-AI-SKILL or institutional token'), {
      target: { value: 'some-partner' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Seal & Commit via Cloud KMS/ }));
    await waitFor(() => expect(alertDialog).toHaveBeenCalled(), { timeout: 3000 });

    expect({
      alertMessages: alertDialog.mock.calls.map((call) => call[0]),
      successText: container.innerHTML.includes('Cloud KMS envelope updated in PostgreSQL'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alertMessages: ['403 admin_routes_disabled'],
      successText: false,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('broker rebates rejected decommission proposal: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: { configs: [brokerConfigWire] } },
      'POST /v1/admin/broker-configs/bingx/decommission/propose': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<BrokerRebatesPage />);
    await screen.findByText('12.5% Rebate');
    fireEvent.click(screen.getByRole('button', { name: 'TERMINATED' }));
    fireEvent.click(await screen.findByRole('button', { name: /Submit Proposal \(Maker\)/ }));
    await screen.findByText('403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('403 admin_routes_disabled'),
      successText: container.innerHTML.includes('Decommission proposal registered'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: true, successText: false, localStorageLength: 0, setItemCalls: 0 });
  });

  it('broker rebates rejected decommission approval: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': {
        status: 200,
        body: {
          configs: [
            {
              ...brokerConfigWire,
              id: 'cfg-bingx-1',
              exchange: 'bingx',
              decommissionProposal: {
                proposedBy: 'maker-1',
                proposedAt: '2026-10-01T00:00:00Z',
                reason: 'some reason',
                status: 'PENDING_APPROVAL',
              },
            },
          ],
        },
      },
      'POST /v1/admin/broker-configs/bingx/decommission/approve': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<BrokerRebatesPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Approve \(Checker\)/ }));
    await screen.findByText('403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('403 admin_routes_disabled'),
      successText: container.innerHTML.includes('successfully decommissioned'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: true, successText: false, localStorageLength: 0, setItemCalls: 0 });
  });

  it('broker rebates rejected decommission rejection: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'prompt').mockReturnValue('some reason');
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': {
        status: 200,
        body: {
          configs: [
            {
              ...brokerConfigWire,
              id: 'cfg-bingx-1',
              exchange: 'bingx',
              decommissionProposal: {
                proposedBy: 'maker-1',
                proposedAt: '2026-10-01T00:00:00Z',
                reason: 'some reason',
                status: 'PENDING_APPROVAL',
              },
            },
          ],
        },
      },
      'POST /v1/admin/broker-configs/bingx/decommission/reject': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<BrokerRebatesPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Reject \(Checker\)/ }));
    await screen.findByText('403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('403 admin_routes_disabled'),
      successText: container.innerHTML.includes('rejected: some reason'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: true, successText: false, localStorageLength: 0, setItemCalls: 0 });
  });

  it('broker rebates rejected attribution dry run: 403 admin_routes_disabled is shown and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const alertDialog = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    stubBackendRoutes({
      'GET /v1/admin/broker-configs?include_inactive=true': { status: 200, body: { configs: [brokerConfigWire] } },
      'POST /v1/admin/broker-configs/test-attribution': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<BrokerRebatesPage />);
    await screen.findByText('12.5% Rebate');
    fireEvent.click(screen.getByRole('button', { name: 'Live Attribution Dry-Run' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Execute Dry-Run Ping' }));
    await waitFor(() => expect(alertDialog).toHaveBeenCalled());

    expect({
      alertMessages: alertDialog.mock.calls.map((call) => call[0]),
      resultPanel: screen.queryByText('Attributed Client Order ID') !== null,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alertMessages: ['403 admin_routes_disabled'],
      resultPanel: false,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });
});
