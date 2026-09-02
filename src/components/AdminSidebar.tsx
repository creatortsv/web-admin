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
    <aside className="w-64 bg-[#070A12] border-r border-[#1E293B] flex flex-col justify-between h-screen sticky top-0 select-none">
      <div>
        {/* Admin Branding Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white font-mono flex items-center gap-1">
              VENOM <span className="text-rose-400">ADMIN</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Back-Office Cockpit</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-[#1E293B] bg-[#05070D]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white truncate max-w-[140px] font-mono">
              {adminEmail.split('@')[0]}
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-400 font-mono tracking-wider">
              {role.replace('_', ' ')}
            </span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="MFA Step-Up Active" />
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-[#1E293B]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
