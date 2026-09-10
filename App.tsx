
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/learn/Layout';
import { ParamsProvider } from './state/ParamsContext';
import Dashboard from './pages/Dashboard';
import Intro from './pages/learn/Intro';
import Payoff from './pages/learn/Payoff';
import Distribution from './pages/learn/Distribution';
import PriceStructure from './pages/learn/PriceStructure';
import TimeDecay from './pages/learn/TimeDecay';
import Greeks from './pages/learn/Greeks';
import MonteCarlo from './pages/learn/MonteCarlo';
import Limitations from './pages/learn/Limitations';

// Must match the `base` in vite.config.ts so the router works both on the
// GitHub Pages project subdirectory and in local dev/preview.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const App: React.FC = () => {
  return (
    <BrowserRouter basename={basename}>
      <ParamsProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Intro />} />
            <Route path="/learn/payoff" element={<Payoff />} />
            <Route path="/learn/distribution" element={<Distribution />} />
            <Route path="/learn/price-structure" element={<PriceStructure />} />
            <Route path="/learn/time-decay" element={<TimeDecay />} />
            <Route path="/learn/greeks" element={<Greeks />} />
            <Route path="/learn/monte-carlo" element={<MonteCarlo />} />
            <Route path="/learn/limitations" element={<Limitations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ParamsProvider>
    </BrowserRouter>
  );
};

export default App;
