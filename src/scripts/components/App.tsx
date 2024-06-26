import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { fetchPreviewHtml } from "../services/questions";
import { classNames } from "../util/classNames";
import * as styles from "./App.module.css";
import { updateTooltipPosition } from "./tooltipPositioner";
import { useTooltipHover } from "./useTooltipHover";

interface AppProps {
  questionAnchors: HTMLAnchorElement[];
}

export const App = ({ questionAnchors }: AppProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipContentContainerRef = useRef<HTMLIFrameElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const [activeReference, setActiveReference] =
    useState<HTMLAnchorElement | null>(null);
  const [content, setContent] = useState<string | undefined>(undefined);

  const fetchAbortController = useRef<AbortController | null>(null);

  const handleQuestionEnter = useCallback(
    async (reference: HTMLAnchorElement) => {
      fetchAbortController.current?.abort();
      fetchAbortController.current = null;

      const ac = new AbortController();
      fetchAbortController.current = ac;

      setContent("Loading");
      setActiveReference(reference);

      // Important: pass the newly created AbortController's signal
      // instead of reading it via fetchAbortController.current each time!
      // Otherwise if a new one is created and set to the ref, the reference
      // changes to a non-aborted signal!
      const html = await fetchPreviewHtml(reference.href, ac.signal);
      ac.signal.throwIfAborted();
      setContent(html);
    },
    []
  );

  const handleQuestionLeave = useCallback(() => {
    fetchAbortController.current?.abort();
    fetchAbortController.current = null;
    setContent(undefined);
  }, []);

  const { onTooltipMouseEnter, onTooltipMouseLeave } = useTooltipHover(
    questionAnchors,
    {
      onEnter: handleQuestionEnter,
      onLeave: handleQuestionLeave,
      showDelay: 250,
      hideDelay: 250,
    }
  );
  useLayoutEffect(() => {
    if (
      !activeReference ||
      !content ||
      !tooltipRef.current ||
      !arrowRef.current ||
      !tooltipContentContainerRef.current
    ) {
      return;
    }

    updateTooltipPosition(
      // <a> itself can be shorter than fullwidth so target the
      // parent <h3> instead
      activeReference.parentElement!,
      tooltipRef.current,
      tooltipContentContainerRef.current,
      arrowRef.current
    );
  }, [activeReference, content]);

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      className={classNames(styles.tooltip, content && styles.tooltipVisible)}
      onMouseEnter={onTooltipMouseEnter}
      onMouseLeave={onTooltipMouseLeave}
    >
      <iframe
        ref={tooltipContentContainerRef}
        className={styles.tooltipContent}
        srcDoc={content}
        sandbox=""
      />
      <div ref={arrowRef} className={styles.arrow}></div>
    </div>
  );
};
