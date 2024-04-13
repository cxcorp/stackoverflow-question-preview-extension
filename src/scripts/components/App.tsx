import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { fetchQuestionHtml } from "../services/questions";
import { classNames } from "../util/classNames";
import * as styles from "./App.module.css";
import { updateTooltipPosition } from "./tooltipPositioner";
import { useTooltipHover } from "./useTooltipHover";

interface AppProps {
  questionAnchors: HTMLAnchorElement[];
}

export const App = ({ questionAnchors }: AppProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipContentContainerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const [activeReference, setActiveReference] =
    useState<HTMLAnchorElement | null>(null);
  const [content, setContent] = useState<React.ReactNode>(null);

  const fetchAbortController = useRef<AbortController | null>(null);

  const handleQuestionEnter = useCallback(
    async (reference: HTMLAnchorElement) => {
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
        fetchAbortController.current = null;
      }

      const ac = new AbortController();
      fetchAbortController.current = ac;

      setContent("Loading");
      setActiveReference(reference);

      // Important: pass the newly created AbortController's signal
      // instead of reading it via fetchAbortController.current each time!
      // Otherwise if a new one is created and set to the ref, the reference
      // changes to a non-aborted signal!
      const html = await fetchQuestionHtml(reference.href, ac.signal);
      ac.signal.throwIfAborted();
      setContent(<div dangerouslySetInnerHTML={{ __html: html }} />);
    },
    []
  );

  const handleQuestionLeave = useCallback(() => {
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
      fetchAbortController.current = null;
    }
    setContent(null);
  }, []);

  useTooltipHover(questionAnchors, handleQuestionEnter, handleQuestionLeave);

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
    >
      <div ref={tooltipContentContainerRef} className={styles.tooltipContent}>
        <div className={styles.contentContainer}>{content}</div>
      </div>
      <div ref={arrowRef} className={styles.arrow}></div>
    </div>
  );
};
