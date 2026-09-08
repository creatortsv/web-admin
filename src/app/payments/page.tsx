'use client';

import * as React from 'react';
import {
  adminApi,
  UniversalGateway,
  UniversalGatewayConfig,
} from '@/services/adminApi';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Check,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
} from 'lucide-react';

export default function PaymentsPage() {
  const [gateways, setGateways] = React.useState<UniversalGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = React.useState<string>('stripe');
  const [environment, setEnvironment] = React.useState<'TEST' | 'LIVE'>('TEST');
  const [config, setConfig] = React.useState<UniversalGatewayConfig | null>(null);

  const [secretKey, setSecretKey] = React.useState('');
  const [webhookSecret, setWebhookSecret] = React.useState('');
  const [priceMappings, setPriceMappings] = React.useState<Record<string, string>>({
    STARTER: 'price_starter_123',
    PRO: 'price_pro_456',
    ENTERPRISE: 'price_ent_789',
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isRotating, setIsRotating] = React.useState(false);
  const [rotateSuccess, setRotateSuccess] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);

  // Load gateways
  React.useEffect(() => {
    adminApi.listUniversalGateways().then((res) => {
      setGateways(res);
    });
  }, []);

  // Load config when selected gateway or environment changes
  React.useEffect(() => {
    setIsLoading(true);
    setTestResult(null);
    adminApi
      .getUniversalGatewayConfig(selectedGateway, environment)
      .then((cfg) => {
        setConfig(cfg);
        if (cfg.planPriceMappings && Object.keys(cfg.planPriceMappings).length > 0) {
          setPriceMappings(cfg.planPriceMappings);
        }
      })
      .finally(() => setIsLoading(false));
  }, [selectedGateway, environment]);

  const handleToggleGateway = async (gw: UniversalGateway) => {
    const updatedStatus = !gw.isEnabled;
    setGateways((prev) =>
      prev.map((g) => (g.name === gw.name ? { ...g, isEnabled: updatedStatus } : g))
    );
    if (config && config.gatewayName === gw.name) {
      const updated = { ...config, isEnabled: updatedStatus };
      setConfig(updated);
      await adminApi.updateUniversalGatewayConfig({
        gatewayName: gw.name,
        environment,
        isEnabled: updatedStatus,
        secretKey: '',
        webhookSecret: '',
        planPriceMappings: priceMappings,
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await adminApi.testGatewayConnection(
        selectedGateway,
        environment,
        secretKey
      );
      setTestResult(res);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRotateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return;

    setIsRotating(true);
    try {
      const res = await adminApi.updateUniversalGatewayConfig({
        gatewayName: selectedGateway,
        environment,
        isEnabled: config?.isEnabled ?? true,
        secretKey: secretKey.trim(),
        webhookSecret: webhookSecret.trim(),
        planPriceMappings: priceMappings,
        rotateExisting: true,
      });

      setConfig(res.config);
      setRotateSuccess(true);
      setSecretKey('');
      setWebhookSecret('');
      setTimeout(() => setRotateSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to rotate credentials:', err);
    } finally {
      setIsRotating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-rose-400" />
            Payment Gateway Switchboard & KMS Sealing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Universal provider orchestration with envelope-encrypted credentials and zero-downtime secret rotation.
          </p>
        </div>

        {/* Environment Toggle Pill */}
        <div className="flex items-center gap-2 bg-[#0D1322] border border-[#1E293B] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setEnvironment('TEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              environment === 'TEST'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧪 Sandbox (TEST)
          </button>
          <button
            type="button"
            onClick={() => setEnvironment('LIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              environment === 'LIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚀 Production (LIVE)
          </button>
        </div>
      </div>

      {/* Provider Switchboard Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {gateways.map((gw) => {
          const isSelected = selectedGateway === gw.name;
          return (
            <button
              key={gw.name}
              type="button"
              onClick={() => setSelectedGateway(gw.name)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-rose-500/50 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                  : 'border-[#1E293B] bg-[#0D1322] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    gw.isEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    gw.isEnabled
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border border-[#1E293B]'
                  }`}
                >
                  {gw.isEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <h4 className="font-bold text-xs text-white font-mono mt-2 truncate">
                {gw.displayName}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                {gw.type}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Configuration Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Gateway State & Test Connection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Status Card */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-rose-400" />
                <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide">
                  {config?.displayName || selectedGateway} Config
                </h3>
              </div>

              {config && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    Version:{' '}
                    <strong className="text-rose-300">v{config.version}</strong>
                  </span>
                  <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {config.status}
                  </span>
                </div>
              )}
            </div>

            {/* Status Details */}
            <div className="grid grid-cols-2 gap-4 bg-[#070A12] border border-[#1E293B] rounded-lg p-4 font-mono text-xs">
              <div>
                <span className="text-slate-500 block mb-1">State:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const found = gateways.find((g) => g.name === selectedGateway);
                      if (found) handleToggleGateway(found);
                    }}
                    className="cursor-pointer"
                  >
                    {config?.isEnabled ? (
                      <ToggleRight className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-600" />
                    )}
                  </button>
                  <span className={config?.isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {config?.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">KMS Envelope Sealing:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  AES-256-GCM / KMS DEK
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Current Secret Key:</span>
                <span className="text-slate-300">
                  {config?.maskedSecretKey || 'None configured'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Webhook Secret:</span>
                <span className="text-slate-300">
                  {config?.maskedWebhookSecret || 'None configured'}
                </span>
              </div>
            </div>

            {/* Webhook Endpoint Display */}
            <div>
              <label className="block text-slate-400 font-mono text-xs mb-1.5">
                Provider Webhook Destination:
              </label>
              <div className="flex items-center gap-2 bg-[#070A12] border border-[#1E293B] rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
                <span className="text-rose-400 font-bold">POST</span>
                <span className="truncate flex-1">
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                  {config?.webhookUrl || `/v1/billing/webhooks/${selectedGateway}`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}${
                        config?.webhookUrl || `/v1/billing/webhooks/${selectedGateway}`
                      }`
                    )
                  }
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedWebhook ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Connection Test Button */}
            <div className="pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-white">Live Connection Ping</h4>
                  <p className="text-[11px] text-slate-400">
                    Verify API key credentials directly with the gateway provider.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold border border-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs font-mono flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plan Price ID Mappings */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide">
                Plan Price ID Mappings ({selectedGateway.toUpperCase()})
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Map Venom Finance subscription tiers to Stripe price identifiers (e.g.{' '}
              <code>price_1Pabc...</code>).
            </p>

            <div className="space-y-3 font-mono text-xs">
              {['STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
                <div key={plan} className="grid grid-cols-3 gap-3 items-center">
                  <span className="text-slate-300 font-bold">{plan}</span>
                  <input
                    type="text"
                    value={priceMappings[plan] || ''}
                    onChange={(e) =>
                      setPriceMappings((prev) => ({ ...prev, [plan]: e.target.value }))
                    }
                    placeholder={`price_${plan.toLowerCase()}_...`}
                    className="col-span-2 px-3 py-1.5 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rotate & Seal Credentials Form */}
        <div className="lg:col-span-5 rounded-xl border border-[#1E293B] bg-[#0D1322] p-6 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Rotate & Seal Credentials
            </h3>
          </div>

          {/* Grace Period Notice Banner */}
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
            <div className="text-[11px] leading-relaxed">
              <strong>Seamless Secret Rotation:</strong> When saving new keys, previous webhook secrets
              remain in RAM cache for a 48-hour grace period so in-flight payments complete without dropped webhooks.
            </div>
          </div>

          <form onSubmit={handleRotateCredentials} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
                New API Secret Key (e.g.{' '}
                {environment === 'TEST' ? 'sk_test_...' : 'sk_live_...'})
              </label>
              <input
                type="password"
                placeholder={environment === 'TEST' ? 'sk_test_...' : 'sk_live_...'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                New Webhook Signing Secret (e.g. whsec_...)
              </label>
              <input
                type="password"
                placeholder="whsec_..."
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isRotating || !secretKey.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {rotateSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {rotateSuccess
                  ? 'Credentials Sealed & Rotated'
                  : isRotating
                  ? 'Sealing with Cloud KMS DEK...'
                  : 'Rotate & Seal (Cloud KMS DEK)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
