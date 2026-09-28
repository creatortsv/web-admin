/**
 * Centralized Storage Keys Contract
 * Single Source of Truth for Local & Session Storage Keys
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.1, §4.4]
 */

export const STORAGE_KEYS = {
  ADMIN_ACCESS_TOKEN: 'admin_access_token',
  ADMIN_VAULTS: 'vf_admin_vaults',
  ADMIN_PAYMENTS: 'vf_admin_payments',
  ADMIN_USERS: 'vf_admin_users',
  ADMIN_FLEET_BOTS: 'vf_admin_fleet_bots',
  UNIVERSAL_GATEWAYS: 'vf_admin_universal_gateways',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
