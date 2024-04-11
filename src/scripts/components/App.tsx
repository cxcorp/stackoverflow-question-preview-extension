import {
  arrow,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { fetchQuestionHtml } from "../services/questions";
import { classNames } from "../util/classNames";
import * as styles from "./App.module.css";

const MAX_DIALOG_WIDTH = 700;
const MAX_DIALOG_HEIGHT = 550;

const updateTooltip = (
  reference: HTMLElement,
  floating: HTMLElement,
  tooltipContentContainer: HTMLElement,
  arrowElement: HTMLElement
) => {
  return computePosition(reference, floating, {
    placement: "bottom",
    middleware: [
      offset(6),
      flip(),
      size({
        padding: 10,
        apply({ availableWidth, availableHeight, elements }) {
          const maxWidth = Math.min(availableWidth, MAX_DIALOG_WIDTH);
          const maxHeight = Math.min(availableHeight, MAX_DIALOG_HEIGHT);
          Object.assign(elements.floating.style, {
            maxWidth: `${maxWidth}px`,
            maxHeight: `${maxHeight}px`,
          });

          // Also need to set a max height to the div which is the
          // or otherwise it just overflows out of the tooltip. We don't
          // want to set `overflow:scroll` to the tooltip parent div
          // or otherwise it clips out the arrow element.
          Object.assign(tooltipContentContainer.style, {
            maxWidth: `${maxWidth}px`,
            maxHeight: `${maxHeight - 10}px`,
          });
        },
      }),
      arrow({ padding: 10, element: arrowElement }),
      shift({ padding: 10 }),
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
        left:
          typeof data.x !== "undefined" && data.x !== null ? `${data.x}px` : "",
        top:
          typeof data.y !== "undefined" && data.y !== null ? `${data.y}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-7px",
        transform: staticSide === "top" ? "rotate(45deg)" : "rotate(225deg)",
      });
    }
  });
};

interface AppProps {
  questions: HTMLAnchorElement[];
}

const useQuestionHover = (
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

export const App = ({ questions }: AppProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipContentContainerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const [activeReference, setActiveReference] =
    useState<HTMLAnchorElement | null>(null);
  const [content, setContent] = useState<React.ReactNode>(null);

  const fetchAbortController = useRef<AbortController | null>(null);

  const handleQuestionEnter = useCallback(
    async (reference: HTMLAnchorElement) => {
      fetchAbortController.current?.abort();
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
        fetchAbortController.current = null;
      }

      if (!tooltipRef.current) return;
      if (!arrowRef.current) return;

      console.log(reference.href);

      const ac = new AbortController();
      fetchAbortController.current = ac;

      setContent("Loading");
      setActiveReference(reference);

      const html = await fetchQuestionHtml(reference.href, ac.signal);
      setContent(<div dangerouslySetInnerHTML={{ __html: html }} />);
    },
    []
  );

  const handleQuestionLeave = useCallback(() => {
    fetchAbortController.current?.abort();
    setContent(null);
  }, []);

  useQuestionHover(questions, handleQuestionEnter, handleQuestionLeave);

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

    updateTooltip(
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
