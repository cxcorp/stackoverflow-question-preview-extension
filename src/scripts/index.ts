import { renderRoot } from "./root";

function main() {
  const questions = document.querySelectorAll<HTMLAnchorElement>(
    "#questions .s-post-summary--content-title > a"
  );

  if (questions.length === 0) {
    return;
  }

  const unmount = renderRoot(document.body, [...questions]);
  console.log("unmount:", unmount);

  // (
  //   [
  //     ["mouseenter", showTooltip],
  //     ["mouseleave", hideTooltip],
  //     ["focus", showTooltip],
  //     ["blur", hideTooltip],
  //   ] as const
  // ).forEach(([event, listener]) => {
  //   question.addEventListener(event, listener);
  // });
}

main();
