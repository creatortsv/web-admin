'use client';

import * as React from 'react';
import { adminApi, AdminUser } from '@/services/adminApi';
import { Users, ShieldAlert, Ban, CheckCircle, Search, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    adminApi.getUsers().then(setUsers);
  }, []);

  const handleStatusChange = (userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    if (confirm(`Change status of user ${userId} to ${status}?`)) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status } : u))
      );
    }
  };

  const handleRoleChange = (userId: string, role: 'super_admin' | 'admin' | 'trader' | 'sandbox') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
            User Moderation & Access Control
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Super-Admin controls to suspend suspicious accounts, revoke Redis sessions, and assign platform roles.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search email or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm font-mono placeholder:text-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-slate-950/90 border-b border-slate-800/80 text-slate-300 uppercase tracking-wider text-xs">
              <tr>
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Role Assignment</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Active Bots</th>
                <th className="py-4 px-6">Volume Traded</th>
                <th className="py-4 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-rose-400 font-mono">
                        {u.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white font-sans text-sm">{u.email}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer font-mono"
                    >
                      <option value="super_admin">super_admin</option>
                      <option value="admin">admin</option>
                      <option value="trader">trader</option>
                      <option value="sandbox">sandbox</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/35'
                          : u.status === 'SUSPENDED'
                          ? 'bg-amber-950/50 text-amber-400 border border-amber-500/35'
                          : 'bg-rose-950/50 text-rose-400 border border-rose-500/35'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-semibold">{u.activeBotsCount} active</td>
                  <td className="py-4 px-6 text-slate-200 font-semibold">${u.totalVolumeUsd.toLocaleString('en-US')}</td>
                  <td className="py-4 px-6 text-right space-x-2.5">
                    {u.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u.id, 'BANNED')}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/70 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
