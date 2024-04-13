import { createPreviewHtml } from "./previewHtmlCreator";

const cachedQuestionHtmls = new Map<string, string>();

const validateQuestionUrl = (href: string): string => {
  const url = new URL(href);
  if (
    url.host !== "stackoverflow.com" ||
    !/^\/questions\/\d+\//.test(url.pathname)
  ) {
    throw new Error(`Invalid url: "${href}"`);
  }
  return url.toString();
};

const fetchQuestionPageHtml = async (
  href: string,
  signal: AbortSignal
): Promise<string> => {
  signal.throwIfAborted();

  const res = await fetch(href, {
    method: "GET",
    mode: "no-cors",
    signal: signal,
  });
  if (!res.ok) {
    throw new Error("res not ok");
  }

  return await res.text();
};

export const fetchPreviewHtml = async (
  href: string,
  abortSignal: AbortSignal
): Promise<string> => {
  abortSignal.throwIfAborted();

  href = validateQuestionUrl(href);

  if (cachedQuestionHtmls.has(href)) {
    return cachedQuestionHtmls.get(href)!;
  }

  const pageHtml = await fetchQuestionPageHtml(href, abortSignal);
  abortSignal.throwIfAborted();

  const html = createPreviewHtml(pageHtml);
  cachedQuestionHtmls.set(href, html);
  return html;
};
