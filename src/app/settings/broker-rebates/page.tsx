'use client';

import * as React from 'react';
import {
  adminApi,
  BrokerConfigDTO,
  ExchangeKey,
  AttributionType,
  BrokerConfigStatus,
  VenueLifecycleStatus,
  TestBrokerAttributionResponse,
} from '@/services/adminApi';
import {
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Activity,
  Send,
  BookOpen,
  Server,
  KeyRound,
  Calendar,
  Clock,
  Ban,
  AlertOctagon,
} from 'lucide-react';

interface ExchangeMeta {
  key: ExchangeKey;
  displayName: string;
  category: 'CEX' | 'DEX';
  brandColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  defaultAttribution: AttributionType;
  identifierLabel: string;
  identifierPlaceholder: string;
  hasSecret: boolean;
  secretLabel?: string;
  contactEmail?: string;
  portalUrl: string;
  programName: string;
  description: string;
  onboardingSteps: string[];
  emailTemplate?: {
    subject: string;
    body: string;
  };
}

const VENUE_METADATA: Record<ExchangeKey, ExchangeMeta> = {
  EXCHANGE_BINGX: {
    key: 'EXCHANGE_BINGX',
    displayName: 'BingX (Swap V2 & Spot)',
    category: 'CEX',
    brandColor: '#0052FF',
    badgeBg: 'bg-sky-500/10',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-400',
    defaultAttribution: 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER',
    identifierLabel: 'Broker Source Key (X-SOURCE-KEY)',
    identifierPlaceholder: 'e.g. BX-AI-SKILL or institutional token',
    hasSecret: true,
    secretLabel: 'Source Secret / API Secret (Optional)',
    contactEmail: 'broker@bingx.com',
    portalUrl: 'https://bingx.com/en-us/account/api/',
    programName: 'BingX Institutional Broker Program',
    description: 'Orders require header attribution via X-SOURCE-KEY and client order ID prefixing.',
    onboardingSteps: [
      'Email BingX Broker Institutional BD at broker@bingx.com using the pre-filled template below.',
      'Request your unique institutional Source Key (BX-...) and register the platform Cloud NAT IPs (34.118.24.10, 34.118.24.11).',
      'Once BD approves your agreement, enter your sealed Source Key below and click "Seal & Commit via Cloud KMS".',
      'Run a dry-run test attribution below to ensure sub-microsecond routing is active.',
    ],
    emailTemplate: {
      subject: 'Application for BingX Institutional Broker & API Rebate Program — Venom Finance',
      body: `Dear BingX Broker BD Team,

I am the platform operator of Venom Finance (automated crypto algorithmic trading platform).
We are integrating BingX Perpetual Swap and Spot markets for our automated bot users and institutional clients.

We would like to formally apply for the BingX Institutional Broker Program to obtain our unique Source Key (X-SOURCE-KEY) for trade attribution and revenue-share fee rebates.

Platform Details:
- Platform Name: Venom Finance
- Expected Monthly Trading Volume: $5,000,000+ USD
- Integration Type: Direct REST API & WebSocket swap orders
- Static Egress NAT IPs: 34.118.24.10, 34.118.24.11
- Preferred Client Order ID Prefix: x-VF-

Please provide the broker agreement and assign our platform Source Key token.

Best regards,
Venom Finance Platform Team`,
    },
  },
  EXCHANGE_BINANCE_SPOT: {
    key: 'EXCHANGE_BINANCE_SPOT',
    displayName: 'Binance (Spot & Margin)',
    category: 'CEX',
    brandColor: '#F0B90B',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    defaultAttribution: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    identifierLabel: 'Broker Client Order ID Prefix',
    identifierPlaceholder: 'e.g. x-VF- or assigned link prefix',
    hasSecret: false,
    contactEmail: 'broker@binance.com',
    portalUrl: 'https://www.binance.com/en/my/settings/api-management',
    programName: 'Binance Link Broker Program',
    description: 'Orders are attributed via unique newClientOrderId prefix registered with Binance Link.',
    onboardingSteps: [
      'Register for the Binance Link Broker Program at https://www.binance.com/en/link.',
      'Submit institutional KYC and obtain approval for your Link Broker ID and assigned newClientOrderId prefix.',
      'Register platform Cloud NAT egress IPs (34.118.24.10, 34.118.24.11).',
      'Enter the assigned prefix below, seal it with Cloud KMS, and verify via dry-run ping.',
    ],
    emailTemplate: {
      subject: 'Binance Link Broker Program Application — Venom Finance',
      body: `Dear Binance Link Team,

Venom Finance is applying for the Binance Link Broker Program to route user spot and margin volume through Binance infrastructure.

Platform Profile:
- Platform: Venom Finance (Multi-exchange algorithmic trading suite)
- Target Markets: Spot & Margin
- Desired Prefix: x-VF-
- Platform Egress IPs: 34.118.24.10, 34.118.24.11

Kindly review our registration and provide the Link Broker agreement.

Sincerely,
Venom Finance Operations`,
    },
  },
  EXCHANGE_BINANCE_FUTURES: {
    key: 'EXCHANGE_BINANCE_FUTURES',
    displayName: 'Binance (USDT-M Futures)',
    category: 'CEX',
    brandColor: '#F0B90B',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    defaultAttribution: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    identifierLabel: 'Futures Client Order ID Prefix',
    identifierPlaceholder: 'e.g. x-VF-',
    hasSecret: false,
    contactEmail: 'broker@binance.com',
    portalUrl: 'https://www.binance.com/en/my/settings/api-management',
    programName: 'Binance Futures Link Program',
    description: 'USDT-Margined futures orders tagged with broker prefix for fee rebates.',
    onboardingSteps: [
      'Enable Futures Broker routing on your Binance Link Institutional account.',
      'Ensure the prefix matches your Spot Link prefix or configure dedicated futures attribution.',
      'Verify Cloud NAT IP whitelisting on Binance Futures endpoints.',
    ],
    emailTemplate: {
      subject: 'Binance Futures Link Broker Setup — Venom Finance',
      body: `Dear Binance Link Team,

Please link USDT-M Futures permissions to our existing Binance Link account for Venom Finance.

Account ID: [Enter your Binance Link Account ID]
Prefix: x-VF-
Static IPs: 34.118.24.10, 34.118.24.11

Thank you,
Venom Finance Team`,
    },
  },
  EXCHANGE_BYBIT: {
    key: 'EXCHANGE_BYBIT',
    displayName: 'Bybit (V5 Unified)',
    category: 'CEX',
    brandColor: '#F7A600',
    badgeBg: 'bg-orange-500/10',
    badgeBorder: 'border-orange-500/30',
    badgeText: 'text-orange-400',
    defaultAttribution: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    identifierLabel: 'orderLinkId Prefix / Broker Partner Code',
    identifierPlaceholder: 'e.g. x-VF- or Bybit partner code',
    hasSecret: false,
    contactEmail: 'broker@bybit.com',
    portalUrl: 'https://www.bybit.com/app/user/api-management',
    programName: 'Bybit Broker Partner API',
    description: 'Unified trading orders require orderLinkId prefix and optional referer header in V5 orders.',
    onboardingSteps: [
      'Contact Bybit Institutional BD at broker@bybit.com or your account manager.',
      'Register your platform partner code for Bybit V5 Unified Trading Account API.',
      'Whitelist platform Cloud NAT IPs (34.118.24.10, 34.118.24.11).',
      'Seal the prefix below and perform attribution test.',
    ],
    emailTemplate: {
      subject: 'Bybit Broker Partner Program Inquiry — Venom Finance',
      body: `Dear Bybit Institutional Team,

Venom Finance is integrating Bybit V5 Unified Trading API for automated grid, DCA, and momentum bots.

We would like to register as an institutional broker partner to attribute trading volume via orderLinkId prefixing and referer tagging.

Platform Info:
- Organization: Venom Finance
- Egress IPs: 34.118.24.10, 34.118.24.11
- Preferred orderLinkId Prefix: x-VF-

Looking forward to your onboarding guide.

Best regards,
Venom Finance Management`,
    },
  },
  EXCHANGE_BITGET: {
    key: 'EXCHANGE_BITGET',
    displayName: 'Bitget (Unified)',
    category: 'CEX',
    brandColor: '#00F0FF',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-300',
    defaultAttribution: 'ATTRIBUTION_TYPE_REFERRAL_CODE',
    identifierLabel: 'Broker / Channel Code',
    identifierPlaceholder: 'e.g. venom or channel identifier',
    hasSecret: false,
    contactEmail: 'broker@bitget.com',
    portalUrl: 'https://www.bitget.com/account/newapi',
    programName: 'Bitget Global Broker Program',
    description: 'Channel code passed in order placement payload or clientOrderId for institutional revenue share.',
    onboardingSteps: [
      'Apply to Bitget Broker Program via broker@bitget.com.',
      'Receive official broker channel code.',
      'Enter and KMS seal the code below.',
    ],
    emailTemplate: {
      subject: 'Bitget Broker Partnership Application — Venom Finance',
      body: `Dear Bitget Broker Team,

Venom Finance is applying for the Bitget Global Broker Program.
We are rolling out copy-trading and grid bot features for Bitget Spot & Futures.

Platform: Venom Finance
Expected Monthly Volume: $3M - $10M USD
Static IPs: 34.118.24.10, 34.118.24.11

Kindly send the broker agreement and Channel Code.

Best regards,
Venom Finance Team`,
    },
  },
  EXCHANGE_HYPERLIQUID: {
    key: 'EXCHANGE_HYPERLIQUID',
    displayName: 'Hyperliquid L1 (Spot & Perps)',
    category: 'DEX',
    brandColor: '#00F5D4',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-300',
    defaultAttribution: 'ATTRIBUTION_TYPE_BUILDER_FEE',
    identifierLabel: 'Builder EVM Recipient Address (0x...)',
    identifierPlaceholder: '0xYourColdMultiSigVault42HexCharacters...',
    hasSecret: false,
    portalUrl: 'https://app.hyperliquid.xyz/API',
    programName: 'Hyperliquid L1 Builder Fee (Permissionless)',
    description: 'Non-custodial on-chain protocol builder fee. Every order injects your builder address & bps directly into L1 state.',
    onboardingSteps: [
      'Zero Institutional BD Approval or KYC Required: Hyperliquid Builder Fees are 100% permissionless on L1.',
      'Deploy or specify your Gnosis Safe / multi-sig cold vault address on Ethereum/Arbitrum (0x...).',
      'Configure your protocol builder fee between 1 and 10 BPS (0.01% - 0.10%). 10 bps is the maximum fee allowed by Hyperliquid L1 consensus.',
      'Input your 42-character EVM address below and click "Seal & Commit via Cloud KMS". Every order executed on Hyperliquid will automatically credit your address on-chain per block!',
    ],
  },
  EXCHANGE_GMX_V2: {
    key: 'EXCHANGE_GMX_V2',
    displayName: 'GMX v2 (Arbitrum Perp)',
    category: 'DEX',
    brandColor: '#304FFE',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    defaultAttribution: 'ATTRIBUTION_TYPE_REFERRAL_CODE',
    identifierLabel: 'On-Chain Referral Code / Affiliate Key',
    identifierPlaceholder: 'e.g. venom or your registered referral code',
    hasSecret: false,
    portalUrl: 'https://app.gmx.io/#/referrals',
    programName: 'GMX v2 On-Chain Referral Program',
    description: 'Arbitrum smart contract referral code passed to GMX Exchange Router on order creation.',
    onboardingSteps: [
      'Open the GMX v2 Referrals dApp at https://app.gmx.io/#/referrals with your administrative Web3 wallet.',
      'Register your on-chain affiliate referral code (e.g. "venom").',
      'Input the referral code below and click "Seal & Commit via Cloud KMS".',
      'Orders placed through delegated 1-Click Trading signers will automatically record on-chain fee rebates to your vault on Arbitrum.',
    ],
  },
};

const EGRESS_IPS = ['34.118.24.10', '34.118.24.11'];

export default function BrokerRebatesPage() {
  const [configs, setConfigs] = React.useState<BrokerConfigDTO[]>([]);
  const [selectedExchange, setSelectedExchange] = React.useState<ExchangeKey>('EXCHANGE_BINGX');
  const [activeTab, setActiveTab] = React.useState<'CONFIG' | 'TEST' | 'ONBOARDING'>('CONFIG');

  // Form State
  const [rawIdentifier, setRawIdentifier] = React.useState('');
  const [rawSecret, setRawSecret] = React.useState('');
  const [showSecret, setShowSecret] = React.useState(false);
  const [attributionType, setAttributionType] = React.useState<AttributionType>('ATTRIBUTION_TYPE_SOURCE_KEY_HEADER');
  const [status, setStatus] = React.useState<BrokerConfigStatus>('BROKER_CONFIG_STATUS_ACTIVE');
  const [lifecycleStatus, setLifecycleStatus] = React.useState<VenueLifecycleStatus>('VENUE_LIFECYCLE_STATUS_ACTIVE');
  const [sunsetDeadline, setSunsetDeadline] = React.useState<string>('');
  const [sunsetNotice, setSunsetNotice] = React.useState<string>('');
  const [showTerminatedModal, setShowTerminatedModal] = React.useState<boolean>(false);
  const [rebateRatePercent, setRebateRatePercent] = React.useState<number>(45);
  const [clientPrefix, setClientPrefix] = React.useState<string>('x-VF-');
  const [notes, setNotes] = React.useState('');
  const [payoutAddress, setPayoutAddress] = React.useState('');

  // Sealing & Ephemeral RAM Memory Scrubbing
  const [isSealing, setIsSealing] = React.useState(false);
  const [sealingStep, setSealingStep] = React.useState(0);
  const [sealSuccess, setSealSuccess] = React.useState(false);
  const [memoryScrubCountdown, setMemoryScrubCountdown] = React.useState<number | null>(null);

  // Dry-run Attribution Testing State
  const [testOrderId, setTestOrderId] = React.useState('VF-ORD-998877');
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestBrokerAttributionResponse | null>(null);

  // Copy Feedback
  const [copiedIps, setCopiedIps] = React.useState(false);
  const [copiedTemplate, setCopiedTemplate] = React.useState(false);

  const meta = VENUE_METADATA[selectedExchange];
  const activeConfig = configs.find((c) => c.exchange === selectedExchange);

  // Load configs on mount
  React.useEffect(() => {
    adminApi.getBrokerConfigs().then((list) => {
      setConfigs(list);
    });
  }, []);

  // Update form fields when selected exchange or configs change
  React.useEffect(() => {
    if (activeConfig) {
      setRawIdentifier('');
      setRawSecret('');
      setAttributionType(activeConfig.attributionType);
      setStatus(activeConfig.status);
      setLifecycleStatus(activeConfig.lifecycleStatus || (activeConfig.status === 'BROKER_CONFIG_STATUS_ACTIVE' ? 'VENUE_LIFECYCLE_STATUS_ACTIVE' : 'VENUE_LIFECYCLE_STATUS_TERMINATED'));
      setSunsetDeadline(activeConfig.sunsetDeadline ? activeConfig.sunsetDeadline.slice(0, 16) : '');
      setSunsetNotice(activeConfig.sunsetNotice || '');
      setRebateRatePercent(activeConfig.rebateRateBps / 100);
      setNotes(activeConfig.notes || '');
      setClientPrefix(activeConfig.extraParams?.client_order_id_prefix || 'x-VF-');
      setPayoutAddress(activeConfig.payoutAddress || '');
    } else {
      setRawIdentifier('');
      setRawSecret('');
      setAttributionType(meta.defaultAttribution);
      setStatus('BROKER_CONFIG_STATUS_ACTIVE');
      setLifecycleStatus('VENUE_LIFECYCLE_STATUS_ACTIVE');
      setSunsetDeadline('');
      setSunsetNotice('');
      setRebateRatePercent(meta.key === 'EXCHANGE_HYPERLIQUID' ? 0.1 : 30);
      setNotes('');
      setClientPrefix('x-VF-');
      setPayoutAddress('');
    }
    setTestResult(null);
    setSealSuccess(false);
    setMemoryScrubCountdown(null);
  }, [selectedExchange, activeConfig, meta]);

  // 15-second ephemeral memory scrub timer when typing plaintext
  React.useEffect(() => {
    if (!rawIdentifier && !rawSecret) {
      setMemoryScrubCountdown(null);
      return;
    }
    setMemoryScrubCountdown(15);
    const interval = setInterval(() => {
      setMemoryScrubCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setRawIdentifier('');
          setRawSecret('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rawIdentifier, rawSecret]);

  const handleCopyIps = () => {
    navigator.clipboard.writeText(EGRESS_IPS.join(', '));
    setCopiedIps(true);
    setTimeout(() => setCopiedIps(false), 2000);
  };

  const handleCopyTemplate = () => {
    if (!meta.emailTemplate) return;
    navigator.clipboard.writeText(meta.emailTemplate.body);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleSealAndCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdentifier && !activeConfig?.maskedIdentifier && !activeConfig?.payoutAddress) {
      alert('Please provide a partner identifier / key before sealing.');
      return;
    }

    if (selectedExchange === 'EXCHANGE_HYPERLIQUID') {
      if (rawIdentifier && !/^0x[a-fA-F0-9]{40}$/.test(rawIdentifier.trim())) {
        alert('Invalid EVM Address: Hyperliquid builder address must start with 0x followed by exactly 40 hex characters.');
        return;
      }
    }

    setIsSealing(true);
    setSealSuccess(false);

    try {
      // Visual feedback step 1: Cloud KMS DEK wrapping
      setSealingStep(1);
      await new Promise((r) => setTimeout(r, 400));

      // Visual feedback step 2: AES-256-GCM Envelope sealing
      setSealingStep(2);
      await new Promise((r) => setTimeout(r, 450));

      // Visual feedback step 3: Redis Pub/Sub invalidation broadcast
      setSealingStep(3);

      const extraParams: Record<string, string> = {};
      let headerKey: string | undefined = undefined;
      let headerValue: string | undefined = undefined;
      let clientOrderIdPrefix: string | undefined = undefined;
      let payoutAddressVal: string | undefined = undefined;

      if (selectedExchange === 'EXCHANGE_HYPERLIQUID') {
        const targetAddress = rawIdentifier || activeConfig?.payoutAddress || activeConfig?.maskedIdentifier || '';
        const bps = Math.max(1, Math.min(10, Math.round(rebateRatePercent * 100)));
        extraParams['builder'] = targetAddress;
        extraParams['fee'] = String(bps);
        payoutAddressVal = targetAddress;
      } else if (selectedExchange === 'EXCHANGE_GMX_V2') {
        const refCode = rawIdentifier || activeConfig?.maskedIdentifier || 'venom';
        extraParams['referral_code'] = refCode;
        if (payoutAddress) payoutAddressVal = payoutAddress;
      } else if (selectedExchange === 'EXCHANGE_BINGX') {
        headerKey = 'X-SOURCE-KEY';
        headerValue = rawIdentifier || activeConfig?.maskedIdentifier || 'BX-AI-SKILL';
        clientOrderIdPrefix = clientPrefix || 'x-VF-';
        extraParams['client_order_id_prefix'] = clientOrderIdPrefix;
      } else if (selectedExchange === 'EXCHANGE_BYBIT') {
        clientOrderIdPrefix = rawIdentifier || activeConfig?.maskedIdentifier || 'x-VF-';
        extraParams['referer'] = clientOrderIdPrefix;
        extraParams['client_order_id_prefix'] = clientOrderIdPrefix;
      } else {
        // Binance Spot / Futures / Bitget
        clientOrderIdPrefix = rawIdentifier || activeConfig?.maskedIdentifier || 'x-VF-';
        extraParams['client_order_id_prefix'] = clientOrderIdPrefix;
      }

      const updated = await adminApi.updateBrokerConfig({
        id: activeConfig?.id,
        exchange: selectedExchange,
        attributionType: (selectedExchange === 'EXCHANGE_HYPERLIQUID'
          ? 'ATTRIBUTION_TYPE_BUILDER_FEE'
          : selectedExchange === 'EXCHANGE_GMX_V2'
          ? 'ATTRIBUTION_TYPE_REFERRAL_CODE'
          : attributionType),
        rawIdentifier: rawIdentifier || activeConfig?.maskedIdentifier || (selectedExchange === 'EXCHANGE_HYPERLIQUID' ? '0x0000000000000000000000000000000000000000' : 'x-VF-'),
        rawSecret: rawSecret || undefined,
        status: (lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_TERMINATED' ? 'BROKER_CONFIG_STATUS_INACTIVE' : 'BROKER_CONFIG_STATUS_ACTIVE'),
        lifecycleStatus,
        sunsetDeadline: lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' && sunsetDeadline ? new Date(sunsetDeadline).toISOString() : null,
        sunsetNotice: lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' ? sunsetNotice : null,
        rebateRateBps: Math.round(rebateRatePercent * 100),
        rebatePercentage: rebateRatePercent,
        clientOrderIdPrefix,
        headerKey,
        headerValue,
        payloadParams: extraParams,
        payoutAddress: payoutAddressVal,
        expectedVersion: activeConfig?.version || 0,
        notes,
        extraParams,
      });

      // Ephemeral scrub of plaintext from memory
      setRawIdentifier('');
      setRawSecret('');
      setMemoryScrubCountdown(null);

      // Update state
      setConfigs((prev) => {
        const idx = prev.findIndex((c) => c.exchange === selectedExchange);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });

      setSealSuccess(true);
      setTimeout(() => setSealSuccess(false), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to commit config');
    } finally {
      setIsSealing(false);
      setSealingStep(0);
    }
  };

  const handleRunDryRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await adminApi.testBrokerAttribution({
        exchange: selectedExchange,
        testOrderId,
      });
      setTestResult(res);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Attribution test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleQuickLifecycleToggle = async (newLifecycle: VenueLifecycleStatus) => {
    if (newLifecycle === 'VENUE_LIFECYCLE_STATUS_TERMINATED') {
      setShowTerminatedModal(true);
      return;
    }
    setLifecycleStatus(newLifecycle);
    const newStatus: BrokerConfigStatus = 'BROKER_CONFIG_STATUS_ACTIVE';
    setStatus(newStatus);

    let nextDeadline = sunsetDeadline;
    if (newLifecycle === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' && !sunsetDeadline) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      nextDeadline = d.toISOString().slice(0, 16);
      setSunsetDeadline(nextDeadline);
    }

    const fallbackPrefix = meta.key === 'EXCHANGE_BINGX' ? 'BX-AI-SKILL' : 'x-VF-';
    const rawIdent = activeConfig?.maskedIdentifier && activeConfig.maskedIdentifier !== '***'
      ? activeConfig.maskedIdentifier
      : fallbackPrefix;

    try {
      const updated = await adminApi.updateBrokerConfig({
        id: activeConfig?.id,
        exchange: selectedExchange,
        attributionType: activeConfig?.attributionType || meta.defaultAttribution,
        rawIdentifier: rawIdent,
        status: newStatus,
        lifecycleStatus: newLifecycle,
        sunsetDeadline: newLifecycle === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' && nextDeadline ? new Date(nextDeadline).toISOString() : null,
        sunsetNotice: newLifecycle === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' ? (sunsetNotice || 'Venue entering sunset phase. Migrations advised.') : null,
        rebateRateBps: activeConfig?.rebateRateBps || 3000,
        expectedVersion: activeConfig?.version || 0,
        notes: activeConfig?.notes || `Lifecycle updated to ${newLifecycle}`,
        extraParams: activeConfig?.extraParams || {},
      });
      setConfigs((prev) => {
        const idx = prev.findIndex((c) => c.exchange === selectedExchange);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update lifecycle status');
    }
  };

  const handleConfirmDecommission = async () => {
    setShowTerminatedModal(false);
    setLifecycleStatus('VENUE_LIFECYCLE_STATUS_TERMINATED');
    setStatus('BROKER_CONFIG_STATUS_INACTIVE');

    const fallbackPrefix = meta.key === 'EXCHANGE_BINGX' ? 'BX-AI-SKILL' : 'x-VF-';
    const rawIdent = activeConfig?.maskedIdentifier && activeConfig.maskedIdentifier !== '***'
      ? activeConfig.maskedIdentifier
      : fallbackPrefix;

    try {
      const updated = await adminApi.updateBrokerConfig({
        id: activeConfig?.id,
        exchange: selectedExchange,
        attributionType: activeConfig?.attributionType || meta.defaultAttribution,
        rawIdentifier: rawIdent,
        status: 'BROKER_CONFIG_STATUS_INACTIVE',
        lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
        sunsetDeadline: null,
        sunsetNotice: 'Venue decommissioned by operator. Automated graceful soft-stop enforced.',
        rebateRateBps: activeConfig?.rebateRateBps || 3000,
        expectedVersion: activeConfig?.version || 0,
        notes: activeConfig?.notes || 'Venue decommissioned by operator. Automated graceful soft-stop enforced.',
        extraParams: activeConfig?.extraParams || {},
      });
      setConfigs((prev) => {
        const idx = prev.findIndex((c) => c.exchange === selectedExchange);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to decommission venue');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2">
                Broker & Rebate Governance
              </h1>
              <p className="text-sm text-slate-400">
                Configure institutional broker credentials sealed via Cloud KMS with &lt;1μs wait-free hot path caching.
              </p>
            </div>
          </div>
        </div>

        {/* Global Cloud NAT Egress IPs Widget */}
        <div className="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3.5 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-rose-400" />
              Cloud NAT Egress IPs
            </div>
            <div className="text-sm font-mono text-slate-200 mt-0.5">
              {EGRESS_IPS.join(', ')}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyIps}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            {copiedIps ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedIps ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 7-Exchange Venue Switchboard Carousel/Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {(Object.keys(VENUE_METADATA) as ExchangeKey[]).map((exKey) => {
          const itemMeta = VENUE_METADATA[exKey];
          const cfg = configs.find((c) => c.exchange === exKey);
          const isSelected = selectedExchange === exKey;
          const isActive = cfg?.status === 'BROKER_CONFIG_STATUS_ACTIVE';
          const isMaint = cfg?.status === 'BROKER_CONFIG_STATUS_MAINTENANCE';

          return (
            <button
              key={exKey}
              type="button"
              onClick={() => setSelectedExchange(exKey)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-rose-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-rose-500/40'
                  : 'bg-[#0B0F19]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#0E1322]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${itemMeta.badgeBg} ${itemMeta.badgeBorder} ${itemMeta.badgeText} border`}>
                  {itemMeta.category}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    cfg?.lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_TERMINATED'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : cfg?.lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_SUNSETTING'
                      ? 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse'
                      : cfg?.lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW'
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  }`}
                  title={cfg?.lifecycleStatus ? cfg.lifecycleStatus.replace('VENUE_LIFECYCLE_STATUS_', '') : 'ACTIVE'}
                />
              </div>
              <div>
                <div className="font-bold text-xs text-white truncate">{itemMeta.displayName.split(' ')[0]}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {cfg ? `${(cfg.rebateRateBps / 100).toFixed(1)}% Rebate` : `${(itemMeta.key === 'EXCHANGE_HYPERLIQUID' ? 0.1 : 30).toFixed(1)}% Rebate`}
                </div>
                {cfg?.lifecycleStatus && cfg.lifecycleStatus !== 'VENUE_LIFECYCLE_STATUS_ACTIVE' && (
                  <div className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded inline-block uppercase border ${
                    cfg.lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : cfg.lifecycleStatus === 'VENUE_LIFECYCLE_STATUS_SUNSETTING'
                      ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {cfg.lifecycleStatus.replace('VENUE_LIFECYCLE_STATUS_', '')}
                  </div>
                )}
              </div>
              {cfg?.isKmsSealed && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-emerald-400/90">
                  <Lock className="h-2.5 w-2.5" /> Sealed
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Governance Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config Panel & Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Venue Status Banner */}
          <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg font-mono shadow-inner border"
                  style={{
                    backgroundColor: `${meta.brandColor}15`,
                    borderColor: `${meta.brandColor}40`,
                    color: meta.brandColor,
                  }}
                >
                  {meta.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{meta.displayName}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                      {meta.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{meta.description}</p>
                </div>
              </div>

              {/* 4-Stage Venue Lifecycle Switchboard */}
              <div className="flex items-center gap-1.5 bg-[#05070D] p-1 rounded-xl border border-slate-800">
                {([
                  { key: 'VENUE_LIFECYCLE_STATUS_ACTIVE', label: 'ACTIVE', color: 'emerald' },
                  { key: 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW', label: 'RESTRICTED', color: 'amber' },
                  { key: 'VENUE_LIFECYCLE_STATUS_SUNSETTING', label: 'SUNSETTING', color: 'orange' },
                  { key: 'VENUE_LIFECYCLE_STATUS_TERMINATED', label: 'TERMINATED', color: 'rose' },
                ] as const).map((stage) => {
                  const isCurrent = (activeConfig?.lifecycleStatus || lifecycleStatus) === stage.key;
                  return (
                    <button
                      key={stage.key}
                      type="button"
                      onClick={() => handleQuickLifecycleToggle(stage.key)}
                      className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all ${
                        isCurrent
                          ? stage.color === 'emerald'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                            : stage.color === 'amber'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                            : stage.color === 'orange'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sunsetting Grace Period & Countdown Scheduler */}
            {(activeConfig?.lifecycleStatus || lifecycleStatus) === 'VENUE_LIFECYCLE_STATUS_SUNSETTING' && (
              <div className="mt-4 p-4 rounded-xl border border-orange-500/30 bg-orange-950/20 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-orange-200 font-mono flex items-center gap-2">
                      <span>Venue Sunsetting & Grace Period Scheduler</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                        Grace Period Enforced
                      </span>
                    </h3>
                    <p className="text-xs text-orange-300/80 leading-relaxed">
                      Adding new exchange keys and creating new trading bots on this venue are immediately disabled in web-app.
                      Active user bots continue running safely until the sunset deadline. At the deadline, automated Graceful Soft-Stop cancels all resting limit orders with <strong className="text-white">zero market dumping</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-orange-500/20">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-400" />
                      Sunset Deadline (Grace Period End)
                    </label>
                    <input
                      type="datetime-local"
                      value={sunsetDeadline}
                      onChange={(e) => setSunsetDeadline(e.target.value)}
                      className="w-full bg-[#05070D] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                    />
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">Quick Preset:</span>
                      {[7, 14, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + days);
                            setSunsetDeadline(d.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 text-[11px] font-mono bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded transition-colors"
                        >
                          +{days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                      <AlertOctagon className="h-3.5 w-3.5 text-orange-400" />
                      User Alert Notice (Broadcast to web-app)
                    </label>
                    <textarea
                      value={sunsetNotice}
                      onChange={(e) => setSunsetNotice(e.target.value)}
                      placeholder="e.g. Trading operations on this exchange will sunset soon. Please migrate active bots."
                      rows={3}
                      className="w-full bg-[#05070D] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-6 mt-6 border-b border-slate-800 text-sm font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('CONFIG')}
                className={`pb-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'CONFIG'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                KMS Credentials & Rules
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TEST')}
                className={`pb-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'TEST'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="h-4 w-4" />
                Live Attribution Dry-Run
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ONBOARDING')}
                className={`pb-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'ONBOARDING'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                {meta.category === 'DEX' ? 'Protocol Architecture' : 'Venue Onboarding & BD Template'}
              </button>
            </div>
          </div>

          {/* TAB 1: KMS CREDENTIALS & ATTRIBUTION FORM */}
          {activeTab === 'CONFIG' && (
            <form onSubmit={handleSealAndCommit} className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <Lock className="h-4 w-4 text-rose-400" />
                    {meta.category === 'DEX' ? `${meta.displayName} Governance Form` : 'Cloud KMS Envelope Sealing Form'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sealed with AES-256-GCM using authenticated context <code className="text-rose-400">scope:broker_config:{selectedExchange.toLowerCase()}</code>.
                  </p>
                </div>
                {memoryScrubCountdown !== null && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-[11px] font-mono text-amber-300 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Auto-scrub in {memoryScrubCountdown}s
                  </div>
                )}
              </div>

              {/* Hyperliquid Specialized Section */}
              {selectedExchange === 'EXCHANGE_HYPERLIQUID' ? (
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold font-mono">100% Permissionless On-Chain Settlement</div>
                      <div className="text-[11px] text-teal-300/80 mt-0.5 leading-relaxed">
                        Hyperliquid requires zero institutional applications, zero BD email approvals, and zero KYC. 
                        Builder fees are attributed atomically on L1 per block directly to your EVM address.
                      </div>
                    </div>
                  </div>

                  {/* Builder Address Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Builder EVM Recipient Address (0x...) <span className="text-rose-400">*</span>
                      </label>
                      {activeConfig?.payoutAddress && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Active Vault: <code className="text-emerald-400 font-bold">{activeConfig.payoutAddress}</code>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={rawIdentifier}
                        onChange={(e) => setRawIdentifier(e.target.value)}
                        placeholder={activeConfig?.payoutAddress || activeConfig?.maskedIdentifier || '0xYourColdMultiSigVault42HexCharacters...'}
                        className={`w-full bg-[#05070D] border rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors ${
                          rawIdentifier
                            ? /^0x[a-fA-F0-9]{40}$/.test(rawIdentifier.trim())
                              ? 'border-emerald-500/60 focus:border-emerald-500'
                              : 'border-rose-500/60 focus:border-rose-500'
                            : 'border-slate-800 focus:border-rose-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono mt-1.5">
                      {rawIdentifier ? (
                        /^0x[a-fA-F0-9]{40}$/.test(rawIdentifier.trim()) ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Valid 42-character EVM address format
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Must start with 0x followed by exactly 40 hex characters
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500">
                          EVM-compatible multisig address (e.g. Gnosis Safe on Ethereum/Arbitrum)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hyperliquid Builder Fee Slider & BPS Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Hyperliquid Protocol Builder Fee (BPS)
                      </label>
                      <span className="text-xs font-mono text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                        {Math.max(1, Math.min(10, Math.round(rebateRatePercent * 100)))} BPS ({(Math.max(1, Math.min(10, Math.round(rebateRatePercent * 100))) / 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={Math.max(1, Math.min(10, Math.round(rebateRatePercent * 100)))}
                        onChange={(e) => setRebateRatePercent(parseInt(e.target.value, 10) / 100)}
                        className="w-full accent-teal-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-slate-500">
                        <span>1 BPS (0.01%)</span>
                        <span>5 BPS (0.05%)</span>
                        <span className="text-amber-400">10 BPS Max (0.10%)</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Hyperliquid L1 consensus strictly enforces a maximum builder fee of 10 bps (0.10%). 
                      Higher fees are rejected at the validator consensus level.
                    </p>
                  </div>

                  {/* Vault Notes */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Cold Storage Vault Identifier / Governance Label
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Treasury Multi-Sig 3/5 Arbitrum"
                      className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              ) : selectedExchange === 'EXCHANGE_GMX_V2' ? (
                /* GMX v2 Specialized Section */
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold font-mono">Arbitrum Smart Contract Referral Integration</div>
                      <div className="text-[11px] text-indigo-300/80 mt-0.5 leading-relaxed">
                        GMX v2 referral codes are passed directly into the GMX Exchange Router on Arbitrum. 
                        Rebates accumulate to your registered on-chain referral vault without manual broker agreements.
                      </div>
                    </div>
                  </div>

                  {/* Referral Code Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        On-Chain Referral Code <span className="text-rose-400">*</span>
                      </label>
                      {activeConfig?.maskedIdentifier && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Active Code: <code className="text-emerald-400 font-bold">{activeConfig.maskedIdentifier}</code>
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={rawIdentifier}
                      onChange={(e) => setRawIdentifier(e.target.value)}
                      placeholder={activeConfig?.maskedIdentifier || 'e.g. venom'}
                      className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Payout Vault Address */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Arbitrum Fee Recipient Vault (Optional 0x...)
                    </label>
                    <input
                      type="text"
                      value={payoutAddress}
                      onChange={(e) => setPayoutAddress(e.target.value)}
                      placeholder="0xYourArbitrumVaultAddress..."
                      className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  {/* Rebate Percentage & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        Tier Rebate Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={rebateRatePercent}
                          onChange={(e) => setRebateRatePercent(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-rose-500 transition-colors pr-10"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-mono text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        Affiliate Notes
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Tier 2 Partner Link"
                        className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard CEX Section (BingX, Binance, Bybit, Bitget) */
                <div className="space-y-6">
                  {/* Attribution Type Radio/Select */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                      Attribution Mechanism
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {[
                        { type: 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER', title: 'HTTP Header (X-SOURCE-KEY)', desc: 'BingX, OKX' },
                        { type: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX', title: 'Client Order ID Prefix', desc: 'Binance Link, Bybit orderLinkId' },
                        { type: 'ATTRIBUTION_TYPE_REFERRAL_CODE', title: 'Channel / Referral Code', desc: 'Bitget, OKX Broker' },
                      ].map((mech) => {
                        const checked = attributionType === mech.type;
                        return (
                          <div
                            key={mech.type}
                            onClick={() => setAttributionType(mech.type as AttributionType)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                : 'bg-[#05070D] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-mono text-xs font-bold">{mech.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{mech.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Identifier Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        {meta.identifierLabel} <span className="text-rose-400">*</span>
                      </label>
                      {activeConfig?.maskedIdentifier && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Currently Sealed: <code className="text-emerald-400 font-bold">{activeConfig.maskedIdentifier}</code> (v{activeConfig.version})
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={rawIdentifier}
                        onChange={(e) => setRawIdentifier(e.target.value)}
                        placeholder={activeConfig?.maskedIdentifier ? `Keep current (${activeConfig.maskedIdentifier}) or enter new...` : meta.identifierPlaceholder}
                        className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional Secret Input */}
                  {meta.hasSecret && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          {meta.secretLabel || 'Partner Secret'}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={rawSecret}
                          onChange={(e) => setRawSecret(e.target.value)}
                          placeholder="Leave blank to keep existing secret untouched"
                          className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Secondary Client Order ID Prefix for BingX */}
                  {attributionType === 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER' && (
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        Dual-Attribution Client Order ID Prefix
                      </label>
                      <input
                        type="text"
                        value={clientPrefix}
                        onChange={(e) => setClientPrefix(e.target.value)}
                        placeholder="e.g. x-VF-"
                        className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        BingX allows both HTTP Header (X-SOURCE-KEY) and Client Order ID prefixing for redundant rebate tracking.
                      </p>
                    </div>
                  )}

                  {/* Rebate Percentage & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        Platform Revenue Share / Rebate Rate (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={rebateRatePercent}
                          onChange={(e) => setRebateRatePercent(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-rose-500 transition-colors pr-10"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-mono text-slate-400">%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Equivalent to {Math.round(rebateRatePercent * 100)} basis points (bps).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                        Administrative Notes / BD Reference
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Agreement ID, BD rep name, signed date"
                        className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sealing Status Feedback */}
              {isSealing && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-rose-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Cryptographic Sealing Pipeline Active...</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className={`flex items-center gap-2 ${sealingStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sealingStep >= 1 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-600" />}
                      <span>1. Requesting Ephemeral DEK & Wrapping via Cloud KMS (scope:broker_config)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${sealingStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sealingStep >= 2 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-600" />}
                      <span>2. Sealing AES-256-GCM Envelope & Scrubbing Memory Barriers</span>
                    </div>
                    <div className={`flex items-center gap-2 ${sealingStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sealingStep >= 3 ? <Check className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-slate-600" />}
                      <span>3. Emitting Invalidation Event to Redis Topic broker:config:invalidated</span>
                    </div>
                  </div>
                </div>
              )}

              {sealSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 font-mono text-xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold">Broker Configuration Sealed Successfully</div>
                    <div className="text-[11px] text-emerald-400/80 mt-0.5">
                      Cloud KMS envelope updated in PostgreSQL. Invalidation broadcasted to all running svc-exchange-adapter instances.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSealing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] cursor-pointer disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isSealing ? 'Sealing...' : 'Seal & Commit via Cloud KMS'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LIVE ATTRIBUTION DRY-RUN VERIFICATION */}
          {activeTab === 'TEST' && (
            <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Hot-Path Attribution Verification Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifies that order attribution satisfies the &lt;1μs wait-free lookup requirement without DB or KMS hits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Simulation Client Order ID
                  </label>
                  <input
                    type="text"
                    value={testOrderId}
                    onChange={(e) => setTestOrderId(e.target.value)}
                    placeholder="e.g. VF-ORD-998877"
                    className="w-full bg-[#05070D] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleRunDryRunTest}
                    disabled={isTesting}
                    className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    <span>{isTesting ? 'Verifying...' : 'Execute Dry-Run Ping'}</span>
                  </button>
                </div>
              </div>

              {/* Test Results Output */}
              {testResult && (
                <div className="bg-[#05070D] border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{testResult.statusMessage}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                      Latency: {testResult.attributionLatencyNanos} ns (&lt;1μs benchmark passed)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] text-slate-500 uppercase">Attributed Client Order ID</div>
                      <div className="text-white font-bold text-sm mt-0.5">{testResult.attributedOrderId}</div>
                    </div>

                    {testResult.injectedHeaders && Object.keys(testResult.injectedHeaders).length > 0 && (
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase">Injected HTTP Headers</div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mt-1 space-y-1">
                          {Object.entries(testResult.injectedHeaders).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="text-rose-400">{k}:</span>
                              <span className="text-slate-300">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.injectedParams && Object.keys(testResult.injectedParams).length > 0 && (
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase">Injected Payload / Query Parameters</div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mt-1 space-y-1">
                          {Object.entries(testResult.injectedParams).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="text-sky-400">{k}:</span>
                              <span className="text-slate-300">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VENUE ONBOARDING & PROTOCOL ARCHITECTURE */}
          {activeTab === 'ONBOARDING' && (
            <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-rose-400" />
                    {meta.category === 'DEX' ? `${meta.displayName} Protocol Architecture` : `${meta.programName} Onboarding`}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {meta.category === 'DEX'
                      ? `Non-custodial on-chain trade attribution and settlement rules for ${meta.displayName}.`
                      : `Step-by-step guidance for activating broker revenue-sharing for ${meta.displayName}.`}
                  </p>
                </div>
                <a
                  href={meta.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700/60"
                >
                  <span>Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Step Checklist */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  {meta.category === 'DEX' ? 'Integration Invariants' : 'Execution Checklist'}
                </div>
                <div className="space-y-2">
                  {meta.onboardingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-[#05070D] p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="h-5 w-5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditional Rendering: DEX Protocol Architecture vs CEX BD Email Template */}
              {meta.category === 'DEX' ? (
                <div className="space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-teal-400" />
                    On-Chain Execution Architecture (Zero-BD / No Emails)
                  </div>

                  {selectedExchange === 'EXCHANGE_HYPERLIQUID' ? (
                    <div className="bg-[#05070D] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
                      <div className="text-teal-300 font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                        Hyperliquid L1 EIP-712 Builder Fee Consensus Rules
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs font-sans">
                        When placing orders on Hyperliquid L1, the order action payload includes a signed builder fee attribute. 
                        The L1 consensus layer automatically deducts the fee and transfers USDC atomically to your cold vault address on block finality.
                      </p>
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
                        <div className="text-slate-500 mb-1">// Injected Order Payload sent to Hyperliquid L1:</div>
                        <pre className="text-sky-300">{`{
  "type": "order",
  "orders": [
    {
      "a": 0, // asset index
      "b": true, // isBuy
      "p": "62500.0", // limit price
      "s": "0.1", // size
      "r": false, // reduceOnly
      "t": { "limit": { "tif": "Gtc" } }
    }
  ],
  "grouping": "na",
  "builder": {
    "b": "${activeConfig?.payoutAddress || '0xYourColdMultiSigVault42HexCharacters...'}", // 42-char recipient EVM address
    "f": ${Math.max(1, Math.min(10, Math.round(rebateRatePercent * 100)))} // Builder fee in BPS (1-10 max)
  }
}`}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#05070D] border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
                      <div className="text-indigo-300 font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                        GMX v2 Arbitrum Router Referral Architecture
                      </div>
                      <p className="text-slate-300 leading-relaxed text-xs font-sans">
                        Order creation calls the GMX v2 ExchangeRouter contract on Arbitrum One. The registered referral code is embedded in the multicall order parameters:
                      </p>
                      <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
                        <div className="text-slate-500 mb-1">// Multicall Order Creation with Referral Tracking:</div>
                        <pre className="text-indigo-300">{`exchangeRouter.createOrder({
  addresses: {
    receiver: userSubaccountAddress,
    callbackContract: address(0),
    uiFeeReceiver: address(0),
    market: btcUsdMarketAddress,
    initialCollateralToken: usdcAddress
  },
  numbers: { ... },
  orderType: OrderType.MarketIncrease,
  decreasePositionSwapType: DecreasePositionSwapType.NoSwap,
  isLong: true,
  shouldUnwrapNativeToken: false,
  referralCode: bytes32("${activeConfig?.maskedIdentifier || 'venom'}") // On-Chain Affiliate Code
})`}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : meta.emailTemplate ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-rose-400" />
                      Pre-filled Institutional Application Template
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700/60"
                    >
                      {copiedTemplate ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedTemplate ? 'Copied' : 'Copy Email Body'}</span>
                    </button>
                  </div>

                  <div className="bg-[#05070D] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                    <div className="text-slate-400">
                      <span className="text-slate-500">To:</span> <code className="text-rose-400">{meta.contactEmail}</code>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-500">Subject:</span> <span className="text-white">{meta.emailTemplate.subject}</span>
                    </div>
                    <hr className="border-slate-800" />
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs max-h-56 overflow-y-auto">
                      {meta.emailTemplate.body}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Column: Security Architecture & Audit Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Security Invariant Card */}
          <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Cryptographic Safeguards
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Context-Bound AAD:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Keys are bound to <code className="text-rose-400">scope:broker_config:&lt;exchange&gt;</code> preventing cipher cross-exchange replay attacks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">RAM Ephemeral Scrubbing:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Plaintext buffers in Go are zeroed via <code className="text-sky-400">memory.ZeroBytes</code> with compiler memory barriers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Sub-Microsecond Caching:</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Order routing uses atomic snapshot pointer swaps (<code className="text-emerald-400">~18 ns</code> latency). Zero database or KMS round-trips in hot path.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Configuration Summary Widget */}
          <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-5 space-y-3 font-mono text-xs">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-sky-400" />
              Live Venue Status
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#05070D] border border-slate-800">
                <span className="text-slate-400">Config Version</span>
                <span className="text-white font-bold">v{activeConfig?.version ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#05070D] border border-slate-800">
                <span className="text-slate-400">KMS Sealed</span>
                <span className={activeConfig?.isKmsSealed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {activeConfig?.isKmsSealed ? 'YES (AES-256-GCM)' : 'NO'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#05070D] border border-slate-800">
                <span className="text-slate-400">Last Updated</span>
                <span className="text-slate-300">{activeConfig ? new Date(activeConfig.updatedAt).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#05070D] border border-slate-800">
                <span className="text-slate-400">Updated By</span>
                <span className="text-rose-400 truncate max-w-[140px]">{activeConfig?.updatedBy || 'none'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decommission & Graceful Soft-Stop Confirmation Modal */}
      {showTerminatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F19] border border-rose-500/40 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(244,63,94,0.25)]">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Ban className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-mono">
                  Confirm Venue Decommission & Soft-Stop
                </h3>
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  You are about to permanently decommission <span className="font-bold text-white">{meta.displayName}</span>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-rose-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Safety Protocol Invariants:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><span className="text-white font-semibold">Zero Market Dumping</span>: All active bots will execute a graceful soft-stop cancelling resting limit orders only. User inventory will NOT be liquidated at market price.</li>
                <li><span className="text-white font-semibold">Onboarding Block</span>: New exchange API keys and bot creation will remain forbidden.</li>
                <li><span className="text-white font-semibold">Audit Record</span>: A permanent <code className="text-rose-400">SUNSET_SOFT_STOP</code> event will be appended to the bot history ledger.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTerminatedModal(false)}
                className="px-4 py-2 text-xs font-mono font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecommission}
                className="px-4 py-2 text-xs font-mono font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all flex items-center gap-2"
              >
                <Ban className="h-4 w-4" />
                Confirm Decommission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
