import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "@/app/App";
import { env } from "@/shared/config/env";
import { getDirection, isSupportedLocale } from "@/i18n/locale";

import "@/assets/styles/globals.css";

// Keep <html lang/dir> in sync with the configured locale.
if (isSupportedLocale(env.defaultLocale)) {
  document.documentElement.lang = env.defaultLocale;
  document.documentElement.dir = getDirection(env.defaultLocale);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element (#root) was not found in index.html.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
