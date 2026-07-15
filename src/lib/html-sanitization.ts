import "server-only";

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "html",
  "head",
  "body",
  "title",
  "style",
  "img",
  "picture",
  "source",
  "figure",
  "figcaption",
  "details",
  "summary",
  "mark",
  "section",
  "article",
  "header",
  "footer",
  "main",
  "nav",
  "aside",
  "time",
  "small",
];

/**
 * Product files are uploaded HTML, so they must be treated as untrusted even
 * though only admins can publish them. This keeps document formatting but
 * strips executable elements, event handlers, forms and unsafe URL schemes.
 */
export function sanitizeEbookHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: Array.from(new Set(ALLOWED_TAGS)),
    allowedAttributes: {
      "*": [
        "class",
        "id",
        "title",
        "role",
        "dir",
        "lang",
        "style",
        "aria-*",
        "data-*",
      ],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      source: ["src", "srcset", "type", "media"],
      ol: ["start", "reversed", "type"],
      li: ["value"],
      td: ["colspan", "rowspan", "headers"],
      th: ["colspan", "rowspan", "headers", "scope"],
      time: ["datetime"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      source: ["http", "https", "data"],
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          ...(attributes.target === "_blank"
            ? { rel: "noopener noreferrer" }
            : {}),
        },
      }),
    },
  });
}
