
import React from 'react';
import { Link } from 'react-router-dom';
import { useModelParams } from '../../state/ParamsContext';
import Controls from '../Controls';

interface PageRef {
  to: string;
  label: string;
}

interface LearnPageProps {
  step: number;
  totalSteps?: number;
  title: string;
  tagline: string;
  children: React.ReactNode;
  prev?: PageRef;
  next?: PageRef;
}

const LearnPage: React.FC<LearnPageProps> = ({ step, totalSteps = 8, title, tagline, children, prev, next }) => {
  const { params, setParams } = useModelParams();

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">
          Step {step} of {totalSteps}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-lg text-gray-400">{tagline}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1 lg:sticky lg:top-20">
          <Controls params={params} setParams={setParams} />
          <p className="text-xs text-gray-500 mt-3 px-1 leading-5">
            These sliders drive every chart on this page.{' '}
            <Link to="/" className="text-cyan-400 hover:underline">
              Open the dashboard →
            </Link>
          </p>
        </aside>

        <div className="lg:col-span-3 space-y-8 min-w-0">{children}</div>
      </div>

      <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prev ? (
          <Link
            to={prev.to}
            className="group bg-gray-800/50 border border-gray-700 hover:border-cyan-500 rounded-xl p-4 transition-colors"
          >
            <p className="text-xs text-gray-500 mb-1">← Previous</p>
            <p className="text-sm font-semibold text-gray-200 group-hover:text-cyan-300">{prev.label}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={next.to}
            className="group bg-gray-800/50 border border-gray-700 hover:border-cyan-500 rounded-xl p-4 text-right transition-colors"
          >
            <p className="text-xs text-gray-500 mb-1">Next →</p>
            <p className="text-sm font-semibold text-gray-200 group-hover:text-cyan-300">{next.label}</p>
          </Link>
        ) : (
          <Link
            to="/"
            className="group bg-gray-800/50 border border-cyan-700/50 rounded-xl p-4 text-right transition-colors hover:border-cyan-500"
          >
            <p className="text-xs text-gray-500 mb-1">Finish</p>
            <p className="text-sm font-semibold text-cyan-300">Back to the dashboard</p>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default LearnPage;
