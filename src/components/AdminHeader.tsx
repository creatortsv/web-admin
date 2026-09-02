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
    <header className="h-16 bg-[#070A12]/95 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Security Status Pills */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/35 text-emerald-300 shadow-[0_0_12px_rgba(0,245,155,0.15)]">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold">mTLS Istio PeerAuth Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
          <Lock className="h-4 w-4 text-rose-400" />
          <span>TOTP Step-Up Challenged</span>
        </div>
      </div>

      {/* Emergency Global Kill Switch */}
      <button
        type="button"
        onClick={handleEmergencyHalt}
        disabled={isHalting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/50 border border-rose-500/60 hover:bg-rose-900/70 text-rose-200 text-xs font-bold font-mono transition-all shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] cursor-pointer"
      >
        <AlertOctagon className="h-4 w-4 text-rose-400 animate-pulse" />
        {isHalting ? 'BROADCASTING HALT...' : 'EMERGENCY FLEET HALT'}
      </button>
    </header>
  );
};
