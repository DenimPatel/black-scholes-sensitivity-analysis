import React from 'react';
import { NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';
import { curriculum } from '../../content/curriculum';
import { useGuidedTour } from '../../state/GuidedTourContext';

const railLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 border-l-2 pl-2.5 py-1 text-sm transition-colors ${
    isActive
      ? 'border-[var(--color-accent)] text-slate-900 font-semibold'
      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400'
  }`;

interface ContentsRailProps {
  onNavigate?: () => void;
}

const ContentsRail: React.FC<ContentsRailProps> = ({ onNavigate }) => {
  const { completedIds } = useGuidedTour();

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
        {curriculum.map((s) => {
          const done = completedIds.includes(s.id);
          return (
            <li key={s.path}>
              <NavLink to={s.path} end={s.path === '/learn'} className={railLinkClass} onClick={onNavigate}>
                <span className="flex-1">{s.label}</span>
                {done && <Check size={13} className="text-[var(--color-accent-700)] shrink-0" aria-label="Completed" />}
              </NavLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ContentsRail;
