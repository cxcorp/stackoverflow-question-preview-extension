import { renderRoot } from "./root";

function main() {
  const questions = document.querySelectorAll<HTMLAnchorElement>(
    "#questions .s-post-summary--content-title > a"
  );

  if (questions.length === 0) {
    return;
  }

  renderRoot(document.body, [...questions]);
}

main();
