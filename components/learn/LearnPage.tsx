
import React from 'react';
import { Link } from 'react-router-dom';
import NarrationBar from './NarrationBar';

interface PageRef {
  to: string;
  label: string;
}

interface LearnPageProps {
  stepId: string;
  step: number;
  totalSteps?: number;
  title: string;
  tagline: string;
  children: React.ReactNode;
  prev?: PageRef;
  next?: PageRef;
}

const LearnPage: React.FC<LearnPageProps> = ({ stepId, step, totalSteps = 8, title, tagline, children, prev, next }) => {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-700)] mb-2">
          Step {step} of {totalSteps}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg text-slate-500 mb-4">{tagline}</p>
        <NarrationBar stepId={stepId} />
      </div>

      <div className="space-y-8 min-w-0">{children}</div>

      <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prev ? (
          <Link to={prev.to} className="group glass-card glass-card-hover p-4">
            <p className="text-xs text-slate-500 mb-1">← Previous</p>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-[var(--color-accent-700)]">{prev.label}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.to} className="group glass-card glass-card-hover p-4 text-right">
            <p className="text-xs text-slate-500 mb-1">Next →</p>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-[var(--color-accent-700)]">{next.label}</p>
          </Link>
        ) : (
          <Link
            to="/"
            className="group glass-card glass-card-hover p-4 text-right border-[color-mix(in_srgb,var(--color-accent)_50%,transparent)]"
          >
            <p className="text-xs text-slate-500 mb-1">Finish</p>
            <p className="text-sm font-semibold text-[var(--color-accent-700)]">Back to the dashboard</p>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default LearnPage;
