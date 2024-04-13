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
  const isShowing = useRef<boolean>(false);

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
        isShowing.current = true;
        onEnter(target as T);
      }, showDelay);
    },
    [cancelTimers, onEnter, showDelay]
  );

  const onMouseLeave = useCallback(() => {
    cancelTimers();
    leaveTimeoutHandle.current = setTimeout(() => {
      cancelTimers();
      if (isShowing.current) {
        isShowing.current = false;
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
      if (isShowing.current) {
        onLeave();
      }
    };
  }, [targets, onTargetMouseEnter, onMouseLeave, cancelTimers, onLeave]);

  return {
    onTooltipMouseEnter,
    onTooltipMouseLeave: onMouseLeave,
  };
};
