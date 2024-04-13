import { useEffect } from "react";

export const useTooltipHover = (
  anchors: HTMLAnchorElement[],
  onEnter: (e: HTMLAnchorElement) => void,
  onLeave: () => void
) => {
  useEffect(() => {
    let enterTimeoutHandle: number | null = null;

    const cancelEnterTimer = () => {
      if (enterTimeoutHandle !== null) {
        clearTimeout(enterTimeoutHandle);
        enterTimeoutHandle = null;
      }
    };

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.currentTarget;
      if (!target || !(target instanceof HTMLAnchorElement)) {
        return;
      }

      cancelEnterTimer();
      enterTimeoutHandle = setTimeout(() => {
        cancelEnterTimer();
        onEnter(target);
      }, 500);
    };

    const onMouseLeave = () => {
      cancelEnterTimer();
      onLeave();
    };

    for (const anchor of anchors) {
      anchor.addEventListener("mouseenter", onMouseEnter);
      anchor.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      for (const anchor of anchors) {
        anchor.removeEventListener("mouseenter", onMouseEnter);
        anchor.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [anchors, onEnter, onLeave]);
};
