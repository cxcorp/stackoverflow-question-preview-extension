import { useCallback, useEffect, useRef } from "react";

interface TooltipHoverOptions<T extends HTMLElement> {
  onEnter: (e: T) => void;
  onLeave: () => void;
  showDelay: number;
  hideDelay: number;
}

export const useTooltipHover = <T extends HTMLElement>(
  targets: T[],
  { onEnter, onLeave, showDelay, hideDelay }: TooltipHoverOptions<T>
) => {
  const enterTimeoutHandle = useRef<number | undefined>(undefined);
  const leaveTimeoutHandle = useRef<number | undefined>(undefined);
  const currentlyShownTarget = useRef<T | null>(null);

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

      const t = target as T;
      if (currentlyShownTarget.current === t) {
        return;
      }

      enterTimeoutHandle.current = setTimeout(() => {
        cancelTimers();
        currentlyShownTarget.current = t;
        onEnter(t);
      }, showDelay);
    },
    [cancelTimers, onEnter, showDelay]
  );

  const onMouseLeave = useCallback(() => {
    cancelTimers();
    leaveTimeoutHandle.current = setTimeout(() => {
      cancelTimers();
      if (currentlyShownTarget.current) {
        currentlyShownTarget.current = null;
        onLeave();
      }
    }, hideDelay);
  }, [cancelTimers, onLeave, hideDelay]);

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
      cancelTimers();
      for (const target of targets) {
        target.removeEventListener("mouseenter", onTargetMouseEnter);
        target.removeEventListener("mouseleave", onMouseLeave);
      }
      if (currentlyShownTarget.current) {
        currentlyShownTarget.current = null;
        onLeave();
      }
    };
  }, [targets, onTargetMouseEnter, onMouseLeave, cancelTimers, onLeave]);

  return {
    onTooltipMouseEnter,
    onTooltipMouseLeave: onMouseLeave,
  };
};
