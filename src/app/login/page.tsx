'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/useAdminAuthStore';
import { ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuthStore();
  const [email, setEmail] = React.useState('security-admin@venom.finance');
  const [totpCode, setTotpCode] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit TOTP code.');
      return;
    }

    const success = login(email, totpCode);
    if (success) {
      router.push('/');
    } else {
      setError('Invalid hardware TOTP token.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0D1322] p-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Venom Back-Office</h2>
            <p className="text-[11px] text-slate-400 font-mono">Super-Admin MFA Gate</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Hardware / App TOTP Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white text-center tracking-widest text-base font-bold focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <div className="text-rose-400 text-[11px]">{error}</div>}

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer"
          >
            Authenticate Super-Admin
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
