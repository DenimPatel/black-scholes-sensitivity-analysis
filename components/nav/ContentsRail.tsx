import React from 'react';
import { NavLink } from 'react-router-dom';

export const learnSections = [
  { to: '/learn', label: '1 · Intro' },
  { to: '/learn/payoff', label: '2 · Payoff' },
  { to: '/learn/distribution', label: '3 · Distribution' },
  { to: '/learn/price-structure', label: '4 · Price' },
  { to: '/learn/time-decay', label: '5 · Time decay' },
  { to: '/learn/greeks', label: '6 · Greeks' },
  { to: '/learn/monte-carlo', label: '7 · Monte Carlo' },
  { to: '/learn/limitations', label: '8 · Limitations' },
];

const railLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block border-l-2 pl-2.5 py-1 text-sm transition-colors ${
    isActive
      ? 'border-[var(--color-accent)] text-slate-900 font-semibold'
      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400'
  }`;

interface ContentsRailProps {
  onNavigate?: () => void;
}

const ContentsRail: React.FC<ContentsRailProps> = ({ onNavigate }) => {
  return (
    <nav aria-label="Contents" className="text-sm custom-scrollbar">
      <div className="pb-4 mb-4 border-b border-slate-200">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold">Contents</p>
        <p className="text-xs text-slate-500 mt-1 leading-5">The dashboard, plus the 8-step guided tour.</p>
      </div>
      <ol className="space-y-0.5">
        <li>
          <NavLink to="/" end className={railLinkClass} onClick={onNavigate}>
            Dashboard
          </NavLink>
        </li>
        {learnSections.map((s) => (
          <li key={s.to}>
            <NavLink to={s.to} end={s.to === '/learn'} className={railLinkClass} onClick={onNavigate}>
              {s.label}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ContentsRail;
