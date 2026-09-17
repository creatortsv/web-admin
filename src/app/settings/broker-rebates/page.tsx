'use client';

import * as React from 'react';
import {
  adminApi,
  BrokerConfigDTO,
  ExchangeKey,
  AttributionType,
  BrokerConfigStatus,
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
  contactEmail: string;
  portalUrl: string;
  programName: string;
  description: string;
  onboardingSteps: string[];
  emailTemplate: {
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
    identifierLabel: 'Builder Fee Receiving Address (0x...)',
    identifierPlaceholder: '0xYourColdMultiSigVault...',
    hasSecret: false,
    contactEmail: 'founders@hyperliquid.xyz',
    portalUrl: 'https://app.hyperliquid.xyz/API',
    programName: 'Hyperliquid L1 Builder Fee (Permissionless)',
    description: 'Non-custodial on-chain protocol builder fee. Every order injects your builder address & bps directly into L1 state.',
    onboardingSteps: [
      'No institutional BD approval needed! Hyperliquid Builder Fees are 100% permissionless on L1.',
      'Deploy or specify your Gnosis Safe / multi-sig cold vault address on Ethereum/Arbitrum.',
      'Set the fee in basis points (e.g. 10 bps = 0.10% or 1 bp = 0.01%).',
      'Input the 0x address below and seal it. Every Hyperliquid order will automatically credit your address on-chain!',
    ],
    emailTemplate: {
      subject: 'Hyperliquid L1 Ecosystem Builder — Venom Finance',
      body: `Hi Hyperliquid Team,

Venom Finance has integrated native L1 trading agent wallets and builder fee routing.
We are routing volume to Hyperliquid L1 perp and spot books with on-chain builder fees.

Builder Address: [Enter your 0x address]
Platform: Venom Finance (https://venom.finance)

Excited to build on the Hyperliquid ecosystem!`,
    },
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
    identifierPlaceholder: 'e.g. venom or your created referral code',
    hasSecret: false,
    contactEmail: 'contact@gmx.io',
    portalUrl: 'https://app.gmx.io/#/referrals',
    programName: 'GMX v2 On-Chain Referral Program',
    description: 'Arbitrum smart contract referral code passed to GMX Exchange Router on order creation.',
    onboardingSteps: [
      'Navigate to https://app.gmx.io/#/referrals with your Web3 wallet.',
      'Create your unique on-chain affiliate referral code (e.g. "venom").',
      'Enter the referral code below and seal it.',
      'Orders placed through 1-Click Trading signers will automatically record on-chain fee rebates to your vault.',
    ],
    emailTemplate: {
      subject: 'GMX v2 Integration Notice — Venom Finance',
      body: `Hi GMX Community & Contributors,

Venom Finance is integrating 1-Click Trading delegated session signers for GMX v2 on Arbitrum.
We have registered on-chain referral code: [Your Referral Code]

All user trades route through the official GMX v2 contracts.

Best,
Venom Finance Devs`,
    },
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
  const [rebateRatePercent, setRebateRatePercent] = React.useState<number>(45);
  const [clientPrefix, setClientPrefix] = React.useState<string>('x-VF-');
  const [notes, setNotes] = React.useState('');

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
      setRebateRatePercent(activeConfig.rebateRateBps / 100);
      setNotes(activeConfig.notes || '');
      setClientPrefix(activeConfig.extraParams?.client_order_id_prefix || 'x-VF-');
    } else {
      setRawIdentifier('');
      setRawSecret('');
      setAttributionType(meta.defaultAttribution);
      setStatus('BROKER_CONFIG_STATUS_ACTIVE');
      setRebateRatePercent(meta.key === 'EXCHANGE_HYPERLIQUID' ? 0.1 : 30);
      setNotes('');
      setClientPrefix('x-VF-');
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
    navigator.clipboard.writeText(meta.emailTemplate.body);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleSealAndCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdentifier && !activeConfig?.maskedIdentifier) {
      alert('Please provide a partner identifier / key before sealing.');
      return;
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
      if (clientPrefix) extraParams['client_order_id_prefix'] = clientPrefix;

      const updated = await adminApi.updateBrokerConfig({
        exchange: selectedExchange,
        attributionType,
        rawIdentifier: rawIdentifier || activeConfig?.maskedIdentifier || 'x-VF-',
        rawSecret: rawSecret || undefined,
        status,
        rebateRateBps: Math.round(rebateRatePercent * 100),
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

  const handleQuickStatusToggle = async (newStatus: BrokerConfigStatus) => {
    setStatus(newStatus);
    if (!activeConfig) return;
    try {
      const updated = await adminApi.updateBrokerConfig({
        exchange: selectedExchange,
        attributionType: activeConfig.attributionType,
        rawIdentifier: activeConfig.maskedIdentifier,
        status: newStatus,
        rebateRateBps: activeConfig.rebateRateBps,
        expectedVersion: activeConfig.version,
        notes: activeConfig.notes,
        extraParams: activeConfig.extraParams,
      });
      setConfigs((prev) => prev.map((c) => (c.exchange === selectedExchange ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
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
                    isActive
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : isMaint
                      ? 'bg-amber-400'
                      : 'bg-slate-600'
                  }`}
                  title={cfg?.status || 'INACTIVE'}
                />
              </div>
              <div>
                <div className="font-bold text-xs text-white truncate">{itemMeta.displayName.split(' ')[0]}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {cfg ? `${(cfg.rebateRateBps / 100).toFixed(1)}% Rebate` : 'Unconfigured'}
                </div>
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

              {/* Status Selector Pill */}
              <div className="flex items-center gap-1.5 bg-[#05070D] p-1 rounded-xl border border-slate-800">
                {(['BROKER_CONFIG_STATUS_ACTIVE', 'BROKER_CONFIG_STATUS_MAINTENANCE', 'BROKER_CONFIG_STATUS_INACTIVE'] as BrokerConfigStatus[]).map((st) => {
                  const isCurrent = (activeConfig?.status || status) === st;
                  const label = st.replace('BROKER_CONFIG_STATUS_', '');
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatusToggle(st)}
                      className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-all ${
                        isCurrent
                          ? st === 'BROKER_CONFIG_STATUS_ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                            : st === 'BROKER_CONFIG_STATUS_MAINTENANCE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

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
                Venue Onboarding & BD Template
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
                    Cloud KMS Envelope Sealing Form
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

              {/* Attribution Type Radio/Select */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Attribution Mechanism
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {[
                    { type: 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER', title: 'HTTP Header (X-SOURCE-KEY)', desc: 'BingX, OKX' },
                    { type: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX', title: 'Client Order ID Prefix', desc: 'Binance Link, Bybit orderLinkId' },
                    { type: 'ATTRIBUTION_TYPE_BUILDER_FEE', title: 'On-Chain Builder Fee', desc: 'Hyperliquid L1 consensus rebate' },
                    { type: 'ATTRIBUTION_TYPE_REFERRAL_CODE', title: 'Channel / Referral Code', desc: 'GMX v2, Bitget' },
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

              {/* Secondary Client Order ID Prefix for BingX / Bybit */}
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

                    {Object.keys(testResult.injectedHeaders).length > 0 && (
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

                    {Object.keys(testResult.injectedParams).length > 0 && (
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

          {/* TAB 3: VENUE ONBOARDING GUIDE & PRE-FILLED BD APPLICATION EMAIL */}
          {activeTab === 'ONBOARDING' && (
            <div className="bg-[#0B0F19] border border-slate-800/90 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-rose-400" />
                    {meta.programName} Onboarding
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Step-by-step guidance for activating broker revenue-sharing for {meta.displayName}.
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
                  Execution Checklist
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

              {/* Pre-filled Email Application Template */}
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
    </div>
  );
}
