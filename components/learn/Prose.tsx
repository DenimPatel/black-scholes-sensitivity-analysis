
import React from 'react';

// Typography helpers for the learn pages. Keep the visual language consistent:
// prose is dark ink on paper, callouts are tinted cards, every interactive figure lives
// in a FigureCard with an optional "reading" footer.

export const Prose: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`space-y-4 text-[15px] leading-7 text-slate-700 ${className ?? ''}`}>
    {children}
  </div>
);

export const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-lg leading-8 text-slate-700">{children}</p>
);

export const WhatYouSee: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="my-2 glass-card p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">What you're looking at</p>
    <div className="text-sm leading-6 text-slate-600 space-y-2">{children}</div>
  </div>
);

type CalloutKind = 'idea' | 'watch' | 'try';

const calloutStyles: Record<CalloutKind, { border: string; bg: string; label: string; title: string }> = {
  idea: { border: 'border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]', bg: 'bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]', label: 'text-[var(--color-accent-700)]', title: 'Key idea' },
  watch: { border: 'border-amber-400/60', bg: 'bg-amber-50', label: 'text-amber-700', title: 'Watch out' },
  try: { border: 'border-emerald-400/60', bg: 'bg-emerald-50', label: 'text-emerald-700', title: 'Try this' },
};

export const Callout: React.FC<{ kind: CalloutKind; children: React.ReactNode }> = ({ kind, children }) => {
  const s = calloutStyles[kind];
  return (
    <div className={`rounded-[var(--radius-md)] border ${s.border} ${s.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${s.label} mb-2`}>{s.title}</p>
      <div className="text-sm leading-6 text-slate-700 space-y-2">{children}</div>
    </div>
  );
};

export const FigureCard: React.FC<{
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, children, footer }) => (
  <div className="glass-card p-5">
    {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
    {children}
    {footer && <div className="mt-4 pt-3 border-t border-slate-200 text-sm leading-6 text-slate-500 space-y-1">{footer}</div>}
  </div>
);

export interface Stat {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'good' | 'bad';
}

export const StatRow: React.FC<{ stats: Stat[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {stats.map((s) => (
      <div key={s.label} className="glass-card p-3">
        <p className="text-xs text-slate-500">{s.label}</p>
        <p
          className={`text-base font-mono font-semibold mt-0.5 tabular-nums ${
            s.tone === 'good' ? 'text-emerald-600' : s.tone === 'bad' ? 'text-rose-600' : 'text-slate-900'
          }`}
        >
          {s.value}
        </p>
        {s.hint && <p className="text-[11px] text-slate-400 mt-1 leading-4">{s.hint}</p>}
      </div>
    ))}
  </div>
);

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

export const ToggleGroup: React.FC<{
  label: string;
  options: ToggleOption<string>[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
    <div className="inline-flex glass-chip p-0.5 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 rounded-[var(--radius-sm)] text-sm transition-colors ${
            value === o.value ? 'bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-[var(--color-accent-700)] font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export const Glossary: React.FC<{ terms: { term: string; def: React.ReactNode }[] }> = ({ terms }) => (
  <dl className="space-y-3">
    {terms.map((t) => (
      <div key={t.term} className="border-l-2 border-[color-mix(in_srgb,var(--color-accent)_50%,transparent)] pl-4">
        <dt className="font-semibold text-slate-900 text-sm">{t.term}</dt>
        <dd className="text-sm text-slate-500 leading-6 mt-0.5">{t.def}</dd>
      </div>
    ))}
  </dl>
);
