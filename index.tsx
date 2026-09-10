
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// GitHub Pages SPA fallback: public/404.html stores the originally requested
// path in sessionStorage and redirects to the app entry. Restore it before the
// router mounts so deep links land on the right page with a clean URL.
const savedRoute = sessionStorage.getItem('bs-spa-fallback-route');
if (savedRoute) {
  window.history.replaceState(null, '', savedRoute);
  sessionStorage.removeItem('bs-spa-fallback-route');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find element with ID 'root' to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
