import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastHost } from "./components/ui/Toast";
import { AuthProvider } from "./features/auth/AuthProvider";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastHost>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastHost>
  </React.StrictMode>,
);
