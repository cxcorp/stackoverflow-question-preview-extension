import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { isNotNil } from "./util";

const updateTooltip = (
  reference: HTMLElement,
  floating: HTMLElement,
  arrowElement: HTMLElement
) => {
  computePosition(reference, floating, {
    placement: "bottom",
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 5 }),
      arrow({ element: arrowElement }),
    ],
  }).then(({ x, y, placement, middlewareData }) => {
    Object.assign(floating.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    const data = middlewareData.arrow;
    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]];

    if (staticSide && data) {
      Object.assign(arrowElement.style, {
        left: isNotNil(data.x) ? `${data.x}px` : "",
        top: isNotNil(data.y) ? `${data.y}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px",
      });
    }
  });
};

interface AppProps {
  questions: HTMLAnchorElement[];
}

const App = ({ questions }: AppProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const [question] = questions;
    if (!question) return;
    if (!tooltipRef.current) return;
    if (!arrowRef.current) return;

    updateTooltip(question, tooltipRef.current, arrowRef.current);
  }, [questions]);

  return (
    <div ref={tooltipRef} id="chrome-extension-tooltip" role="dialog">
      <div className="chrome-extension-tooltip-content">content</div>
      <div ref={arrowRef} className="chrome-extension-tooltip--arrow"></div>
    </div>
  );
};

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
