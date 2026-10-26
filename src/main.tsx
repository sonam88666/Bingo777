import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.warn('[GlobalCrashGuard] Intercepted runtime error:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[GlobalCrashGuard] Intercepted unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
}

