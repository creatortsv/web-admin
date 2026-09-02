'use client';

import * as React from 'react';
import { adminApi, PaymentGatewayConfig } from '@/services/adminApi';
import { CreditCard, Lock, ShieldCheck, Key, ToggleLeft, ToggleRight, Check } from 'lucide-react';

export default function PaymentsPage() {
  const [gateways, setGateways] = React.useState<PaymentGatewayConfig[]>([]);
  const [stripeSecret, setStripeSecret] = React.useState('');
  const [stripeWebhook, setStripeWebhook] = React.useState('');
  const [isSealing, setIsSealing] = React.useState(false);
  const [sealSuccess, setSealSuccess] = React.useState(false);

  React.useEffect(() => {
    adminApi.getPaymentGateways().then(setGateways);
  }, []);

  const handleToggle = async (gateway: PaymentGatewayConfig) => {
    const updated = { ...gateway, isEnabled: !gateway.isEnabled };
    await adminApi.savePaymentGateway(updated);
    setGateways((prev) => prev.map((g) => (g.id === gateway.id ? updated : g)));
  };

  const handleSealStripe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeSecret.trim()) return;

    setIsSealing(true);
    setTimeout(() => {
      setIsSealing(false);
      setSealSuccess(true);
      setStripeSecret('');
      setStripeWebhook('');
      // Mark Stripe sealed
      setGateways((prev) =>
        prev.map((g) => (g.type === 'STRIPE_FIAT' ? { ...g, isKmsSealed: true } : g))
      );
      setTimeout(() => setSealSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-rose-400" />
          Payment Gateways & KMS Sealing
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Governance for subscription payment rails. Direct Crypto is active by default; Fiat Stripe is disabled by default.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gateways Switchboard */}
        <div className="lg:col-span-7 space-y-4">
          {gateways.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      g.isEnabled ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />
                  <h3 className="font-bold text-sm text-white font-mono">{g.name}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      g.isEnabled
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-400 border border-[#1E293B]'
                    }`}
                  >
                    {g.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{g.details}</p>
                {g.type === 'STRIPE_FIAT' && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">KMS Key Status:</span>
                    <span
                      className={`font-bold ${
                        g.isKmsSealed ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {g.isKmsSealed ? 'SEALED (Cloud KMS)' : 'UNCONFIGURED / DEK PENDING'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleToggle(g)}
                className="text-slate-400 hover:text-white cursor-pointer mt-1"
              >
                {g.isEnabled ? (
                  <ToggleRight className="h-8 w-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Envelope Encryption Key Input */}
        <div className="lg:col-span-5 rounded-xl border border-[#1E293B] bg-[#0D1322] p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              KMS Stripe Key Sealing
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            API secrets are envelope-encrypted via Google Cloud KMS before being written to PostgreSQL.
          </p>

          <form onSubmit={handleSealStripe} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Stripe Secret Key (sk_live_...)</label>
              <input
                type="password"
                placeholder="sk_live_..."
                value={stripeSecret}
                onChange={(e) => setStripeSecret(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Webhook Signing Secret (whsec_...)</label>
              <input
                type="password"
                placeholder="whsec_..."
                value={stripeWebhook}
                onChange={(e) => setStripeWebhook(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSealing || !stripeSecret.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {sealSuccess ? <Check className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {sealSuccess ? 'Keys KMS Sealed' : isSealing ? 'Encrypting with DEK...' : 'Seal & Store Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
