import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from '@/app/app-provider.tsx'
import { AppRouter } from '@/routes/app-router.tsx'
import '@/theme/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </StrictMode>,
)
