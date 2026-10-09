// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersPage from '../../src/app/users/page';
import {
  ANSWER_ADMIN_ROUTES_DISABLED,
  SKELETON_CLASS,
  stubBackendNeverAnswers,
  stubBackendRoutes,
} from '../support/adminBackend';
import { userWire } from '../support/adminWireFixtures';

describe('users page (/v1/admin/users)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('users loading: a never-answered request shows the skeleton, no data and no empty state', () => {
    stubBackendNeverAnswers();

    const { container } = render(<UsersPage />);

    expect({
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
      emptyState: container.innerHTML.includes('No Registered User Accounts'),
      data: container.innerHTML.includes('user@example.test'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ skeleton: true, emptyState: false, data: false, alerts: 0 });
  });

  it('users error: 403 admin_routes_disabled is shown in an alert, no empty state and no data', async () => {
    stubBackendRoutes({ 'GET /v1/admin/users': ANSWER_ADMIN_ROUTES_DISABLED });

    const { container } = render(<UsersPage />);
    await screen.findByRole('alert');

    expect({
      alerts: screen.getAllByRole('alert').map((alert) => alert.textContent),
      emptyState: container.innerHTML.includes('No Registered User Accounts'),
      data: container.innerHTML.includes('user@example.test'),
      skeleton: container.querySelector(`.${SKELETON_CLASS}`) !== null,
    }).toStrictEqual({
      alerts: ['User accounts could not be loaded403 admin_routes_disabled'],
      emptyState: false,
      data: false,
      skeleton: false,
    });
  });

  it('users empty: the backend empty list shows the empty state and no alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/users': { status: 200, body: { users: [] } } });

    const { container } = render(<UsersPage />);
    await screen.findByText('No Registered User Accounts');

    expect({
      emptyState: container.innerHTML.includes('No Registered User Accounts'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ emptyState: true, alerts: 0 });
  });

  it('users data: the fixture is rendered without an empty state and without an alert', async () => {
    stubBackendRoutes({ 'GET /v1/admin/users': { status: 200, body: { users: [userWire] } } });

    const { container } = render(<UsersPage />);
    await screen.findByText('user@example.test');

    expect({
      data: container.innerHTML.includes('user@example.test'),
      emptyState: container.innerHTML.includes('No Registered User Accounts'),
      alerts: screen.queryAllByRole('alert').length,
    }).toStrictEqual({ data: true, emptyState: false, alerts: 0 });
  });
});
