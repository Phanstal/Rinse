import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from './app/App';
import './styles/app.css';

const platform = Capacitor.getPlatform();
document.documentElement.dataset.platform = platform;
if (Capacitor.isNativePlatform()) {
  document.body.dataset.native = 'true';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
