import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { initSentry } from './lib/sentry';
import { initCapacitor } from './lib/capacitor';

import "./main.css"
import "./styles/theme.css"
import "./index.css"

initSentry();
void initCapacitor();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
