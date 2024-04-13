function* getStylesheetLinkHrefs(doc: Document) {
  const nodes = doc.querySelectorAll<HTMLLinkElement>(
    'link[rel="stylesheet"][type="text/css"]'
  );
  for (const node of nodes) {
    yield node.href;
  }
}

function* getStyleTagContents(doc: Document) {
  const nodes = doc.querySelectorAll<HTMLStyleElement>("style");
  for (const node of nodes) {
    if (!node.textContent) continue;
    yield {
      media: node.media,
      type: node.type,
      disabled: node.disabled,
      css: node.textContent,
    };
  }
}

const copyCss = (from: Document, to: Document) => {
  // Add CSS stylesheets
  for (const href of getStylesheetLinkHrefs(from)) {
    const link = to.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = href;
    to.head.appendChild(link);
  }

  for (const { type, css, disabled, media } of getStyleTagContents(from)) {
    const style = to.createElement("style");
    style.textContent = css;
    style.type = type;
    style.disabled = disabled;
    style.media = media;
    to.head.appendChild(style);
  }
};

const findContentElement = (doc: Document) => {
  const post = doc.querySelector("#question .postcell");
  if (!post) {
    throw new Error("Failed to find question content");
  }
  return post;
};

const setupBody = (
  content: Element,
  referenceBody: HTMLElement,
  output: Document
) => {
  // CSS
  output.body.className = referenceBody.className;

  Object.assign(output.body.style, {
    // remove spacing
    margin: "0",
    // set out own padding
    padding: "10px 15px 0 10px",
    // make background same as popup
    backgroundColor: "var(--black-150, #333638)",
  });

  // Some scripts are embedded inside which cause errors in the console because
  // we don't load the body scripts, just remove them
  // This is *not* an XSS mitigation!
  for (const script of [...content.getElementsByTagName("script")]) {
    script.remove();
  }

  output.body.innerHTML = content.innerHTML;
};

const setupHtml = (from: HTMLElement, to: HTMLElement) => {
  // CSS
  to.className = from.className;
};

export const createPreviewHtml = (questionPageHtml: string) => {
  const domParser = new DOMParser();
  const questionPageDoc = domParser.parseFromString(
    questionPageHtml,
    "text/html"
  );

  const outputDoc = document.implementation.createHTMLDocument();

  copyCss(questionPageDoc, outputDoc);

  const post = findContentElement(questionPageDoc);
  setupBody(post, window.document.body, outputDoc);
  setupHtml(window.document.documentElement, outputDoc.documentElement);

  return outputDoc.documentElement.outerHTML;
};
