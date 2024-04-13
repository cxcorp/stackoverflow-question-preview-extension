import { useCallback, useEffect, useRef } from "react";

export const useTooltipHover = <T extends HTMLElement>(
  targets: T[],
  onEnter: (e: T) => void,
  onLeave: () => void
) => {
  const enterTimeoutHandle = useRef<number | undefined>(undefined);

  const cancelEnterTimer = useCallback(() => {
    clearTimeout(enterTimeoutHandle.current);
    enterTimeoutHandle.current = undefined;
  }, []);

  const onTargetMouseEnter = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      cancelEnterTimer();
      enterTimeoutHandle.current = setTimeout(() => {
        cancelEnterTimer();
        onEnter(target as T);
      }, 500);
    },
    [cancelEnterTimer, onEnter]
  );

  const onMouseLeave = useCallback(() => {
    cancelEnterTimer();
    onLeave();
  }, [cancelEnterTimer, onLeave]);

  useEffect(() => {
    for (const target of targets) {
      target.addEventListener("mouseenter", onTargetMouseEnter);
      target.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      for (const target of targets) {
        target.removeEventListener("mouseenter", onTargetMouseEnter);
        target.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [targets, onTargetMouseEnter, onMouseLeave, cancelEnterTimer, onLeave]);
};
