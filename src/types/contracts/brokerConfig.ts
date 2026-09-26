/**
 * Canonical Protobuf Wire Contracts for BrokerConfigService
 * Single Source of Truth: venom.broker_config.v1 (proto-definitions)
 * Standard: Protocol Buffers v3 JSON Mapping Specification (lowerCamelCase Wire JSON)
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.5]
 */

export const ATTRIBUTION_TYPE = {
  UNSPECIFIED: 'ATTRIBUTION_TYPE_UNSPECIFIED',
  CLIENT_ORDER_ID_PREFIX: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
  HTTP_HEADER: 'ATTRIBUTION_TYPE_HTTP_HEADER',
  PAYLOAD_FIELD: 'ATTRIBUTION_TYPE_PAYLOAD_FIELD',
  BUILDER_TAG: 'ATTRIBUTION_TYPE_BUILDER_TAG',
  HYBRID: 'ATTRIBUTION_TYPE_HYBRID',
} as const;

export type AttributionTypeContract = (typeof ATTRIBUTION_TYPE)[keyof typeof ATTRIBUTION_TYPE];

export const VENUE_LIFECYCLE_STATUS = {
  UNSPECIFIED: 'VENUE_LIFECYCLE_STATUS_UNSPECIFIED',
  ACTIVE: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
  RESTRICTED_NEW: 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
  SUNSETTING: 'VENUE_LIFECYCLE_STATUS_SUNSETTING',
  TERMINATED: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
} as const;

export type VenueLifecycleStatusContract = (typeof VENUE_LIFECYCLE_STATUS)[keyof typeof VENUE_LIFECYCLE_STATUS];

export const BROKER_CONFIG_STATUS = {
  ACTIVE: 'BROKER_CONFIG_STATUS_ACTIVE',
  INACTIVE: 'BROKER_CONFIG_STATUS_INACTIVE',
} as const;

export type BrokerConfigStatusContract = (typeof BROKER_CONFIG_STATUS)[keyof typeof BROKER_CONFIG_STATUS];

export interface DecommissionProposal {
  proposedBy: string;
  proposedAt: string;
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

/**
 * 100% strict wire DTO matching JSON serialized by gRPC-Gateway from venom.broker_config.v1.BrokerConfig
 */
export interface BrokerConfigWireDTO {
  id: string;
  exchange: string;
  exchangeType?: string;
  environment: string;
  brokerId: string;
  clientOrderIdPrefix: string;
  attributionType: AttributionTypeContract;
  headerKey: string;
  headerValue: string;
  payloadParams: Record<string, string>;
  rebatePercentage: number;
  payoutAddress: string;
  isActive: boolean;
  version: number;
  maskedIdentifier: string;
  hasEncryptedSecrets: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  lifecycleStatus: VenueLifecycleStatusContract;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  decommissionProposal?: DecommissionProposal | null;
}

/**
 * Request payload sent to PUT /v1/admin/broker-configs/{id}
 */
export interface UpdateBrokerConfigWireRequest {
  id?: string;
  exchange: string;
  environment?: string;
  broker_id?: string;
  client_order_id_prefix?: string;
  attribution_type?: AttributionTypeContract;
  header_key?: string;
  header_value?: string;
  payload_params?: Record<string, string>;
  payout_address?: string;
  rebate_percentage?: number;
  is_active?: boolean;
  lifecycle_status?: VenueLifecycleStatusContract;
  sunset_deadline?: { seconds: number } | null;
  sunset_notice?: string;
  expected_version?: number;
  change_reason?: string;
  raw_secrets_plaintext?: string;
}

/**
 * Public exchange config wire DTO matching venom.broker_config.v1.PublicExchangeConfig
 */
export interface PublicExchangeConfigWireDTO {
  exchange: string;
  name: string;
  portalUrl: string;
  staticNatIps: string[];
  isBrokerActive: boolean;
  lifecycleStatus?: VenueLifecycleStatusContract;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  allowNewKeys?: boolean;
  allowNewBots?: boolean;
}
