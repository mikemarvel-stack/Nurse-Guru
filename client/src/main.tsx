import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './lib/query-provider'
import { initSentry } from './lib/sentry'
import { reportWebVitals } from './lib/web-vitals'

// Initialize Sentry
initSentry();

// Report web vitals
reportWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
)
