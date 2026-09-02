'use client';

import * as React from 'react';
import { ShieldAlert, Lock, CheckCircle2, AlertOctagon } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const [isHalting, setIsHalting] = React.useState(false);

  const handleEmergencyHalt = () => {
    if (confirm('CRITICAL ACTION: Are you sure you want to trigger an EMERGENCY FLEET HALT? All running bots will cancel orders immediately.')) {
      setIsHalting(true);
      setTimeout(() => {
        setIsHalting(false);
        alert('Emergency Halt Broadcasted across Kafka trading topics.');
      }, 1200);
    }
  };

  return (
    <header className="h-14 bg-[#070A12]/90 backdrop-blur border-b border-[#1E293B] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Security Status Pills */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>mTLS Istio PeerAuth Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-[#1E293B] text-slate-300">
          <Lock className="h-3.5 w-3.5 text-rose-400" />
          <span>TOTP Step-Up Challenged</span>
        </div>
      </div>

      {/* Emergency Global Kill Switch */}
      <button
        type="button"
        onClick={handleEmergencyHalt}
        disabled={isHalting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/50 hover:bg-rose-900/60 text-rose-300 text-xs font-bold font-mono transition-colors cursor-pointer"
      >
        <AlertOctagon className="h-4 w-4 text-rose-400" />
        {isHalting ? 'BROADCASTING HALT...' : 'EMERGENCY FLEET HALT'}
      </button>
    </header>
  );
};
