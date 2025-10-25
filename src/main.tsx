import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";

import { router } from './router'
import './index.css'
import { AuthProvider } from "./components/AuthContext";
import { ChatDockProvider } from "./components/chat/ChatDockContext";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element with id 'root' not found");
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <ChatDockProvider>
      <RouterProvider router={router} />
      </ChatDockProvider>
    </AuthProvider>
  </StrictMode>
);
