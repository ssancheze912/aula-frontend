import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './routes/AppRouter'
import { AuthProvider } from './contexts/AuthContext'
import { LiveAnnouncerProvider } from './components/LiveAnnouncer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiveAnnouncerProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LiveAnnouncerProvider>
  </StrictMode>,
)
