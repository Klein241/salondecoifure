import { ConfirmProvider } from "./components/ConfirmModal.jsx"
import { ErrorBoundary } from "./components/ErrorBoundary.jsx"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { ToastProvider } from "./components/Toast.jsx"
import { TenantProvider } from "./TenantContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TenantProvider>
        <ToastProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </ToastProvider>
      </TenantProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
