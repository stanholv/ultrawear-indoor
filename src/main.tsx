import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth' // <--- Dit is de aanpassing
import { BadgesProvider } from './hooks/useBadges'
import { SeizoenProvider } from './hooks/useSeizoen'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BadgesProvider>
        <SeizoenProvider>
          <App />
        </SeizoenProvider>
      </BadgesProvider>
    </AuthProvider>
  </React.StrictMode>,
)