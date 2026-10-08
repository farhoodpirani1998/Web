import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "@/app/App";

import "@/assets/styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element (#root) was not found in index.html.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
