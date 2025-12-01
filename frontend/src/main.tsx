import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Ajuste o caminho se você colocou o AuthContext em 'src/contexts/'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { initTokenValidation } from './lib/tokenValidator.ts';

// Valida e limpa tokens corrompidos antes de iniciar a aplicação
initTokenValidation();
// Build version: 2025-12-01-v2

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);