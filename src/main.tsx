import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StrictMode } from "react";

import { router } from './router'
import './index.css'

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element with id 'root' not found");
}

ReactDOM.createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
