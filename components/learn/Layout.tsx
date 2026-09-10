
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, SlidersHorizontal, X } from 'lucide-react';
import ContentsRail from '../nav/ContentsRail';
import Controls from '../Controls';
import { useModelParams } from '../../state/ParamsContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { params, setParams } = useModelParams();
  const [contentsOpen, setContentsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setContentsOpen(false);
    setConfigOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass-strong border-b border-[var(--color-divider)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <Link to="/" className="nav-brand shrink-0">
            Black–Scholes
          </Link>
          <div className="flex items-center gap-1 xl:hidden">
            <button type="button" className="btn-ghost" onClick={() => setContentsOpen((v) => !v)}>
              <List size={16} /> Contents
            </button>
            <button type="button" className="btn-ghost" onClick={() => setConfigOpen((v) => !v)}>
              <SlidersHorizontal size={16} /> Configure
            </button>
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1600px] mx-auto flex-1 flex gap-6 p-4 sm:p-6">
        <aside
          className={`${
            contentsOpen ? 'block' : 'hidden'
          } xl:block w-full xl:w-64 shrink-0 xl:sticky xl:top-24 xl:self-start xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto custom-scrollbar`}
        >
          <ContentsRail onNavigate={() => setContentsOpen(false)} />
        </aside>

        <main className={`${contentsOpen ? 'hidden xl:block' : 'block'} flex-1 min-w-0`}>{children}</main>

        <aside
          className={`${
            configOpen ? 'fixed' : 'hidden xl:block xl:sticky'
          } right-0 top-0 xl:top-24 z-40 xl:z-auto h-full xl:h-auto xl:self-start w-[min(22rem,90vw)] shrink-0 overflow-y-auto xl:max-h-[calc(100vh-8rem)] custom-scrollbar glass-strong xl:bg-transparent p-4 xl:p-0`}
        >
          {configOpen && (
            <button
              type="button"
              className="btn-ghost mb-2 xl:hidden"
              onClick={() => setConfigOpen(false)}
              aria-label="Close configuration"
            >
              <X size={16} /> Close
            </button>
          )}
          <Controls params={params} setParams={setParams} />
        </aside>

        {configOpen && (
          <button
            aria-label="Close configuration"
            onClick={() => setConfigOpen(false)}
            className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--color-ink)_20%,transparent)] xl:hidden cursor-default"
          />
        )}
      </div>

      <footer className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-8 text-[11px] text-slate-400 border-t border-[var(--color-divider)]">
        Educational tool: European options priced with Black–Scholes (constant volatility, frictionless markets).
        All values are theoretical, for learning purposes, and not investment advice.
      </footer>
    </div>
  );
};

export default Layout;
