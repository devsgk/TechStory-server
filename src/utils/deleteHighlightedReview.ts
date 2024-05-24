import jsdom from "jsdom";

const { JSDOM } = jsdom;

export function deleteHighlightedReview(htmlString, styleId) {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;
  const target = document.getElementById(styleId);

  if (target) {
    const parent = target.parentNode;
    while (target.firstChild) {
      parent.insertBefore(target.firstChild, target);
    }
    parent.removeChild(target);
  }

  return dom.window.document.body.innerHTML;
}

export function deleteAllHighlightedReviews(htmlString) {
  const dom = new JSDOM(htmlString);
  const document = dom.window.document;

  document.querySelectorAll("span[id]").forEach((span) => {
    const textNode = document.createTextNode(span.textContent);
    span.parentNode.replaceChild(textNode, span);
  });

  return dom.window.document.body.innerHTML;
}
