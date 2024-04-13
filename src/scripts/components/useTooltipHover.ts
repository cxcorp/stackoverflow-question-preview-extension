import { useCallback, useEffect, useRef } from "react";

export const useTooltipHover = <T extends HTMLElement>(
  targets: T[],
  onEnter: (e: T) => void,
  onLeave: () => void
) => {
  const enterTimeoutHandle = useRef<number | undefined>(undefined);
  const leaveTimeoutHandle = useRef<number | undefined>(undefined);

  const cancelTimers = useCallback(() => {
    clearTimeout(enterTimeoutHandle.current);
    clearTimeout(leaveTimeoutHandle.current);
    enterTimeoutHandle.current = leaveTimeoutHandle.current = undefined;
  }, []);

  const onTargetMouseEnter = useCallback(
    (e: MouseEvent) => {
      const target = e.currentTarget;
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      cancelTimers();
      enterTimeoutHandle.current = setTimeout(() => {
        cancelTimers();
        onEnter(target as T);
      }, 500);
    },
    [cancelTimers, onEnter]
  );

  const onMouseLeave = useCallback(() => {
    cancelTimers();
    leaveTimeoutHandle.current = setTimeout(() => {
      cancelTimers();
      onLeave();
    }, 500);
  }, [cancelTimers, onLeave]);

  const onTooltipMouseEnter = useCallback(() => {
    // keep the tooltip open
    cancelTimers();
  }, [cancelTimers]);

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
      onLeave();
    };
  }, [targets, onTargetMouseEnter, onMouseLeave, cancelTimers, onLeave]);

  return {
    onTooltipMouseEnter,
    onTooltipMouseLeave: onMouseLeave,
  };
};
