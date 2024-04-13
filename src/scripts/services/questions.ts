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
  abortSignal: AbortSignal
): Promise<string> => {
  const res = await fetch(href, {
    method: "GET",
    mode: "no-cors",
    signal: abortSignal,
  });
  if (!res.ok) {
    throw new Error("res not ok");
  }

  return await res.text();
};

export const fetchQuestionHtml = async (
  href: string,
  abortSignal: AbortSignal
): Promise<string> => {
  href = validateQuestionUrl(href);

  if (cachedQuestionHtmls.has(href)) {
    return cachedQuestionHtmls.get(href)!;
  }

  const pageHtml = await fetchQuestionPageHtml(href, abortSignal);
  abortSignal.throwIfAborted();

  const domParser = new DOMParser();
  const doc = domParser.parseFromString(pageHtml, "text/html");

  const post = doc.querySelector("#question .postcell");
  if (!post) {
    throw new Error("Failed to find question");
  }

  const html = post.innerHTML;
  cachedQuestionHtmls.set(href, html);
  return html;
};
