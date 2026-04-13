import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// En producción: suprimir warnings ruidosos conocidos (Firestore network / COOP)
if (import.meta.env.PROD) {
  const _err = console.error.bind(console);
  const _warn = console.warn.bind(console);
  const suppressed = [
    'ERR_NETWORK_CHANGED',
    'Firestore/Listen',
    'google.firestore.v1.Firestore/Listen',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Embedder-Policy',
    'window.close',
  ];

  const shouldSuppress = (args) => {
    try {
      const msg = args
        .map((a) => {
          if (typeof a === 'string') return a;
          if (a instanceof Error && a.message) return a.message;
          if (a && typeof a === 'object') return JSON.stringify(a);
          return String(a);
        })
        .join(' ');
      return suppressed.some((s) => msg.includes(s));
    } catch (e) {
      return false;
    }
  };

  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    _err(...args);
  };

  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    _warn(...args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
