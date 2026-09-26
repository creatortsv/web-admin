import * as React from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InstitutionalEmptyStateAction {
  label: string;
  onClick: () => void;
}

export type EmptyStateIcon =
  | LucideIcon
  | React.ComponentType<LucideProps>
  | React.ComponentType<{ className?: string }>;

export interface InstitutionalEmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon: EmptyStateIcon;
  title: string;
  description: string;
  primaryAction?: InstitutionalEmptyStateAction;
  secondaryAction?: InstitutionalEmptyStateAction;
  badge?: string;
  className?: string;
}

export function InstitutionalEmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  badge,
  className,
  ...props
}: InstitutionalEmptyStateProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn(
        'relative flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden transition-all',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {badge && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wider uppercase text-emerald-400">
            {badge}
          </span>
        </div>
      )}

      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80 text-emerald-400 shadow-lg backdrop-blur-md ring-1 ring-white/5">
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <Icon className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(0,245,155,0.4)]" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-white font-sans max-w-md sm:text-2xl">
        {title}
      </h3>

      <p className="mt-2.5 text-sm text-slate-400 max-w-md leading-relaxed font-sans">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[120px]"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white min-w-[120px]"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
