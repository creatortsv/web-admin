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
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            User Moderation & Access Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super-Admin controls to suspend suspicious accounts, revoke Redis sessions, and assign roles.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search email or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0D1322] border border-[#1E293B] text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#070A12] border-b border-[#1E293B] text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Bots</th>
              <th className="py-3.5 px-4">Volume</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{u.email}</div>
                  <div className="text-[10px] text-slate-500">{u.id}</div>
                </td>
                <td className="py-3.5 px-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    className="bg-[#070A12] border border-[#1E293B] rounded px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="super_admin">super_admin</option>
                    <option value="admin">admin</option>
                    <option value="trader">trader</option>
                    <option value="sandbox">sandbox</option>
                  </select>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : u.status === 'SUSPENDED'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300">{u.activeBotsCount} active</td>
                <td className="py-3.5 px-4 text-slate-300">${u.totalVolumeUsd.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {u.status === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                      className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-[11px] transition-colors cursor-pointer"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                      className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-[11px] transition-colors cursor-pointer"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(u.id, 'BANNED')}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-[#1E293B] text-[11px] transition-colors cursor-pointer"
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
  );
}
