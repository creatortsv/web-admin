/**
 * Centralized Storage Keys Contract
 * Single Source of Truth for Local & Session Storage Keys
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.1, §4.4]
 */

export const STORAGE_KEYS = {
  ADMIN_ACCESS_TOKEN: 'admin_access_token',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
