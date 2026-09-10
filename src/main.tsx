import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CoinImagesProvider } from './contexts/CoinImagesContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
  <CoinImagesProvider>
    <App />
  </CoinImagesProvider>
</React.StrictMode>,
)
