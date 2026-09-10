
import React, { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const learnSections = [
  { to: '/learn', label: '1 · Intro' },
  { to: '/learn/payoff', label: '2 · Payoff' },
  { to: '/learn/distribution', label: '3 · Distribution' },
  { to: '/learn/price-structure', label: '4 · Price' },
  { to: '/learn/time-decay', label: '5 · Time decay' },
  { to: '/learn/greeks', label: '6 · Greeks' },
  { to: '/learn/monte-carlo', label: '7 · Monte Carlo' },
  { to: '/learn/limitations', label: '8 · Limitations' },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-2.5 py-1 rounded-md text-sm whitespace-nowrap transition-colors ${
    isActive ? 'bg-cyan-500/15 text-cyan-300' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
  }`;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/" className="text-lg font-bold text-cyan-400 shrink-0">
            Black–Scholes
          </Link>
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <nav className="flex items-center gap-0.5 overflow-x-auto max-w-full [scrollbar-width:none] [-ms-overflow-style:none]">
            {learnSections.map((s) => (
              <NavLink key={s.to} to={s.to} end={s.to === '/learn'} className={navLinkClass}>
                {s.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-xs text-gray-500 border-t border-gray-800">
        Educational tool: European options priced with Black–Scholes (constant volatility, frictionless markets).
        All values are theoretical, for learning purposes, and not investment advice.
      </footer>
    </div>
  );
};

export default Layout;
