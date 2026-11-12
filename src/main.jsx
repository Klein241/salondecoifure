import { ConfirmProvider } from "./components/ConfirmModal.jsx"
import { ErrorBoundary } from "./components/ErrorBoundary.jsx"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

import { ToastProvider } from "./components/Toast.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
    <ToastProvider>
      <ConfirmProvider>
      <App />
    </ConfirmProvider>
    </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

// Enregistrement PWA Service Worker
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] SW registration notice:', err);
    });
  });
}
