
import React from 'react';

// Typography helpers for the learn pages. Keep the visual language consistent:
// prose is gray-300, callouts are tinted cards, every interactive figure lives
// in a FigureCard with an optional "reading" footer.

export const Prose: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`space-y-4 text-[15px] leading-7 text-gray-300 ${className ?? ''}`}>
    {children}
  </div>
);

export const Lead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-lg leading-8 text-gray-300">{children}</p>
);

export const WhatYouSee: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="my-2 rounded-xl border border-gray-700 bg-gray-800/60 p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">What you're looking at</p>
    <div className="text-sm leading-6 text-gray-300 space-y-2">{children}</div>
  </div>
);

type CalloutKind = 'idea' | 'watch' | 'try';

const calloutStyles: Record<CalloutKind, { border: string; bg: string; label: string; title: string }> = {
  idea: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', label: 'text-cyan-400', title: 'Key idea' },
  watch: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', label: 'text-amber-400', title: 'Watch out' },
  try: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', label: 'text-emerald-400', title: 'Try this' },
};

export const Callout: React.FC<{ kind: CalloutKind; children: React.ReactNode }> = ({ kind, children }) => {
  const s = calloutStyles[kind];
  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${s.label} mb-2`}>{s.title}</p>
      <div className="text-sm leading-6 text-gray-300 space-y-2">{children}</div>
    </div>
  );
};

export const FigureCard: React.FC<{
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, children, footer }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
    {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
    {children}
    {footer && <div className="mt-4 pt-3 border-t border-gray-700 text-sm leading-6 text-gray-400 space-y-1">{footer}</div>}
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
      <div key={s.label} className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
        <p className="text-xs text-gray-500">{s.label}</p>
        <p
          className={`text-base font-semibold mt-0.5 ${
            s.tone === 'good' ? 'text-emerald-400' : s.tone === 'bad' ? 'text-rose-400' : 'text-white'
          }`}
        >
          {s.value}
        </p>
        {s.hint && <p className="text-[11px] text-gray-500 mt-1 leading-4">{s.hint}</p>}
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
    <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
    <div className="inline-flex rounded-lg border border-gray-700 bg-gray-900/60 p-0.5 gap-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            value === o.value ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-gray-400 hover:text-gray-200'
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
      <div key={t.term} className="border-l-2 border-cyan-500/50 pl-4">
        <dt className="font-semibold text-white text-sm">{t.term}</dt>
        <dd className="text-sm text-gray-400 leading-6 mt-0.5">{t.def}</dd>
      </div>
    ))}
  </dl>
);
