// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add a dark mode toggle logic helper if needed globally, but we'll default to dark mode by adding the class
document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
