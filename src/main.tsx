import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './design/styles.css';
import { applyAppearance, loadAppearance } from './lib/appearance';
import { App } from './App';

// Settle the appearance before the first paint, so a reader who has pinned
// dark never sees a flash of the light palette.
applyAppearance(loadAppearance());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
