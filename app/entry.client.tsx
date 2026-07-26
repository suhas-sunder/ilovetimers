import { startTransition, StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

declare global {
  interface Window {
    __reactRouterContext?: {
      isSpaMode?: boolean;
    };
  }
}

const app = (
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);

startTransition(() => {
  if (window.__reactRouterContext?.isSpaMode) {
    createRoot(document).render(app);
    return;
  }

  hydrateRoot(document, app);
});
