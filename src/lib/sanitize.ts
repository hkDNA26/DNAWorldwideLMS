import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitises rich-text lesson bodies before they're injected with
 * dangerouslySetInnerHTML.
 *
 * Uses the isomorphic build rather than plain dompurify on purpose: the course
 * player is a client component, but Next still server-renders it. Plain dompurify
 * has no DOM on the server and passes input straight through, so a payload would
 * reach the rendered HTML and run before hydration ever sanitised anything.
 */
export function sanitizeLessonHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // Matches what the Tiptap editor can produce, plus the embeds lessons use.
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
  });
}
