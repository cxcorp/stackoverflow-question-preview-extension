import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

export const renderRoot = (
  tooltipPortalContainer: HTMLElement,
  tooltipActivators: HTMLAnchorElement[]
) => {
  const reactRootNode = document.createElement("div");
  // we can hide the root node because we portal out of it anyways
  reactRootNode.style.display = "none";

  const reactRoot = createRoot(reactRootNode);
  reactRoot.render(
    createPortal(<App questionAnchors={tooltipActivators} />, tooltipPortalContainer)
  );
};
