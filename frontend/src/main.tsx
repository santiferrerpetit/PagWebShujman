/**
 * @fileoverview Entry point de la aplicación.
 * Monta el componente App en el DOM con StrictMode para detección de efectos duplicados en desarrollo.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
