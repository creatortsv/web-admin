'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Users,
  Bot,
  BrainCircuit,
  FileCode2,
  ShieldCheck,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAdminAuthStore } from '@/stores/useAdminAuthStore';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/treasury', label: 'Treasury Vaults', icon: Wallet },
  { href: '/payments', label: 'Payment Gateways', icon: CreditCard },
  { href: '/users', label: 'User Moderation', icon: Users },
  { href: '/bots', label: 'Fleet Supervisor', icon: Bot },
  { href: '/ai-quant', label: 'AI Quant Engine', icon: BrainCircuit },
  { href: '/audit-logs', label: 'Audit Trail', icon: FileCode2 },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { adminEmail, role, logout } = useAdminAuthStore();

  return (
    <aside className="w-72 bg-[#070A12] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none shrink-0 z-30">
      <div>
        {/* Admin Branding Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-base text-white font-mono flex items-center gap-1.5">
              VENOM <span className="text-rose-400">ADMIN</span>
            </div>
            <div className="text-xs text-slate-400 font-mono tracking-wide">Back-Office Cockpit</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/35 shadow-[0_0_20px_rgba(239,68,68,0.15)] font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-5 border-t border-slate-800/80 bg-[#05070D]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate max-w-[160px] font-mono">
              {adminEmail.split('@')[0]}
            </span>
            <span className="text-xs uppercase font-bold text-rose-400 font-mono tracking-wider mt-0.5">
              {role.replace('_', ' ')}
            </span>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="MFA Step-Up Active" />
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-800/90"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
