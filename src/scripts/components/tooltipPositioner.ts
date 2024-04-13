import {
  arrow,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/dom";

const MAX_DIALOG_WIDTH = 700;
const MAX_DIALOG_HEIGHT = 550;

export const updateTooltip = (
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
