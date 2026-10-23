import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupFetchInterceptor } from './services/mockBackend'

// Enable universal API interceptor for GitHub Pages & standalone execution
setupFetchInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
