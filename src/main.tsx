import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth' // <--- Dit is de aanpassing
import { BadgesProvider } from './hooks/useBadges'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BadgesProvider>
        <App />
      </BadgesProvider>
    </AuthProvider>
  </React.StrictMode>,
)