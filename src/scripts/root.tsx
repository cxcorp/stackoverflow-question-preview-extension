import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

export const renderRoot = (
  tooltipPortalContainer: HTMLElement,
  tooltipActivators: HTMLAnchorElement[]
) => {
  const reactRootNode = document.createElement("div");
  reactRootNode.style.display = "none";

  const reactRoot = createRoot(reactRootNode);
  reactRoot.render(
    createPortal(<App questions={tooltipActivators} />, tooltipPortalContainer)
  );
  return () => reactRoot.unmount();
};
