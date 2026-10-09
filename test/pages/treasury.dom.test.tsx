// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TreasuryPage from '../../src/app/treasury/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  SKELETON_CLASS,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { vaultWire } from '../support/adminWireFixtures';

describe('treasury page (/v1/treasury/admin/vaults)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('treasury loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<TreasuryPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Treasury Vaults Configured'),
      data: container.innerHTML.includes('receiving-address'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('treasury error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/treasury/admin/vaults': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<TreasuryPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Treasury Vaults Configured'),
      data: container.innerHTML.includes('receiving-address'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Treasury vaults could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('treasury empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/treasury/admin/vaults': { status: 200, body: { vaults: [] } } });

    const { container } = render(<TreasuryPage />);
    await screen.findByText('No Treasury Vaults Configured');

    expect({
      emptyState: container.innerHTML.includes('No Treasury Vaults Configured'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: true, alerts: 0 });
  });

  it('treasury data: the fixture is rendered without an empty state and without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/treasury/admin/vaults': { status: 200, body: { vaults: [vaultWire] } } });

    const { container } = render(<TreasuryPage />);
    await screen.findByText('receiving-address');

    expect({
      data: container.innerHTML.includes('receiving-address'),
      emptyState: container.innerHTML.includes('No Treasury Vaults Configured'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ data: true, emptyState: false, alerts: 0 });
  });

  it('treasury rejected save: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    stubBackendRoutes({
      'GET /v1/treasury/admin/vaults': { status: 200, body: { vaults: [vaultWire] } },
      'POST /v1/treasury/admin/vaults': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<TreasuryPage />);
    fireEvent.click(await screen.findByText('receiving-address'));
    fireEvent.click(await screen.findByRole('button', { name: /Save Vault Configuration/ }));
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      successText: container.innerHTML.includes('Vault Configuration Saved'),
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      alerts: ['Treasury action failedVault configuration was not saved: 403 admin_routes_disabled'],
      successText: false,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });

  it('treasury rejected sweep: 403 admin_routes_disabled is shown, no success alert and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const confirmDialog = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const successDialog = vi.spyOn(window, 'alert').mockReturnValue(undefined);
    stubBackendRoutes({
      'GET /v1/treasury/admin/vaults': { status: 200, body: { vaults: [vaultWire] } },
      'POST /v1/treasury/admin/vaults/vault-1/sweep': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    render(<TreasuryPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Sweep Cold Safe/ }));
    await screen.findByRole('alert');

    expect({
      confirmCalls: confirmDialog.mock.calls.length,
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      successDialogCalls: successDialog.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      confirmCalls: 1,
      alerts: [
        'Treasury action failedFailed to trigger sweep: Sweep initiation failed (HTTP 403): {"code":7,"message":"admin_routes_disabled"}',
      ],
      successDialogCalls: 0,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });
});
