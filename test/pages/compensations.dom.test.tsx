// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CompensationClaimsPage from '../../src/app/billing/compensations/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  SKELETON_CLASS,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { claimWire } from '../support/adminWireFixtures';

describe('compensations page (/v1/billing/admin/compensations)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('compensations loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<CompensationClaimsPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Compensation Claims'),
      data: container.innerHTML.includes('slippage'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('compensations error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/billing/admin/compensations': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<CompensationClaimsPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Compensation Claims'),
      data: container.innerHTML.includes('slippage'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['Compensation claims could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('compensations empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/billing/admin/compensations': { status: 200, body: { claims: [] } } });

    const { container } = render(<CompensationClaimsPage />);
    await screen.findByText('No Compensation Claims');

    expect({
      emptyState: container.innerHTML.includes('No Compensation Claims'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: true, alerts: 0 });
  });

  it('compensations data: the fixture is rendered without an empty state and without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/billing/admin/compensations': { status: 200, body: { claims: [claimWire] } } });

    const { container } = render(<CompensationClaimsPage />);
    await screen.findByText('slippage');

    expect({
      data: container.innerHTML.includes('slippage'),
      emptyState: container.innerHTML.includes('No Compensation Claims'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ data: true, emptyState: false, alerts: 0 });
  });

  it('compensations rejected approval: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = stubBackendRoutes({
      'GET /v1/billing/admin/compensations': {
        status: 200,
        body: { claims: [{ ...claimWire, status: 'PENDING_APPROVAL' }] },
      },
      'POST /v1/billing/admin/compensations/claim-1/approve': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<CompensationClaimsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    await screen.findByText('Approval failed: 403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('Approval failed: 403 admin_routes_disabled'),
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: true, requests: 2, localStorageLength: 0, setItemCalls: 0 });
  });

  it('compensations rejected rejection: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(window, 'prompt').mockReturnValue('some reason');
    const fetchMock = stubBackendRoutes({
      'GET /v1/billing/admin/compensations': {
        status: 200,
        body: { claims: [{ ...claimWire, status: 'PENDING_APPROVAL' }] },
      },
      'POST /v1/billing/admin/compensations/claim-1/reject': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<CompensationClaimsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    await screen.findByText('Rejection failed: 403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('Rejection failed: 403 admin_routes_disabled'),
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({ failureText: true, requests: 2, localStorageLength: 0, setItemCalls: 0 });
  });

  it('compensations rejected claim creation: 403 admin_routes_disabled is shown, no success text and no storage write', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const fetchMock = stubBackendRoutes({
      'GET /v1/billing/admin/compensations': { status: 200, body: { claims: [claimWire] } },
      'POST /v1/billing/admin/compensations': ANSWER_ADMIN_ROUTES_DISABLED,
    });

    const { container } = render(<CompensationClaimsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Create Claim \(Maker\)/ }));
    fireEvent.change(screen.getByPlaceholderText('e.g. INC-2026-09-003'), { target: { value: 'inc-2' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. usr_trader_42'), { target: { value: 'user-2' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 150.00'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/Price drift caused adverse execution/), {
      target: { value: 'some reason' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Claim' }));
    await screen.findByText('Failed to create claim: 403 admin_routes_disabled');

    expect({
      failureText: container.innerHTML.includes('Failed to create claim: 403 admin_routes_disabled'),
      successText: container.innerHTML.includes('registered for Checker review'),
      requests: fetchMock.mock.calls.length,
      localStorageLength: localStorage.length,
      setItemCalls: setItem.mock.calls.length,
    }).toStrictEqual({
      failureText: true,
      successText: false,
      requests: 2,
      localStorageLength: 0,
      setItemCalls: 0,
    });
  });
});
