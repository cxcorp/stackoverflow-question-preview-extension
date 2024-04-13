import { useCallback, useEffect, useRef } from "react";

export const useTooltipHover = (
  anchors: HTMLAnchorElement[],
  onEnter: (e: HTMLAnchorElement) => void,
  onLeave: () => void
) => {
  const enterTimeoutHandle = useRef<number | null>(null);

  const cancelEnterTimer = useCallback(() => {
    if (enterTimeoutHandle.current !== null) {
      clearTimeout(enterTimeoutHandle.current);
      enterTimeoutHandle.current = null;
    }
  }, []);

  const onTargetMouseEnter = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (!target || !(target instanceof HTMLAnchorElement)) {
        return;
      }

      cancelEnterTimer();
      enterTimeoutHandle.current = setTimeout(() => {
        cancelEnterTimer();
        onEnter(target);
      }, 500);
    },
    [cancelEnterTimer, onEnter]
  );

  const onMouseLeave = useCallback(() => {
    cancelEnterTimer();
    onLeave();
  }, [cancelEnterTimer, onLeave]);

  useEffect(() => {
    for (const anchor of anchors) {
      anchor.addEventListener("mouseenter", onTargetMouseEnter);
      anchor.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      for (const anchor of anchors) {
        anchor.removeEventListener("mouseenter", onTargetMouseEnter);
        anchor.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [anchors, onTargetMouseEnter, onMouseLeave, cancelEnterTimer, onLeave]);
};
