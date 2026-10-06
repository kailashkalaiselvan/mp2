import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'normalize.css'
import '@fontsource-variable/archivo/wdth.css'
import './index.css'
import App from './App'
import { MoviesProvider } from './context/MoviesProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <MoviesProvider>
        <App />
      </MoviesProvider>
    </BrowserRouter>
  </StrictMode>,
)
