import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppGoogleAuthProvider } from '@/components/auth/GoogleAuthProvider';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppGoogleAuthProvider>
      <App />
    </AppGoogleAuthProvider>
  </StrictMode>,
);
