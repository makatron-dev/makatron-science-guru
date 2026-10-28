import React from "react";

/**
 * ChemText
 * --------
 * Renders question/option/explanation text safely, supporting:
 *  - Subscripts for chemical formulas:      H2O -> H2O (2 as <sub>)
 *  - Bold text:                            **bold** and <b>bold</b>
 *  - Italics:                              *italic* and <i>italic</i>
 *  - Inline images (Markdown):             ![alt](https://...)
 *  - Inline images (bracket marker):       [img: https://...] / [image: https://...]
 *  - Line breaks:                          literal \n -> <br />
 *
 * SAFETY: This component NEVER uses dangerouslySetInnerHTML.
 * Every piece of input is rendered as React elements, so a stray
 * "<script>" in question text will be shown as literal text, not executed.
 */
export default function ChemText({ text }) {
  if (text === null || text === undefined || text === "") return null;

  const raw = String(text);

  // Tokenise the string into an array of React-renderable segments.
  // Order of tokens: images > bold > italic > line breaks > chemical subscripts.
  const tokens = [];
  let i = 0;
  let plainBuffer = "";

  const flushPlain = () => {
    if (plainBuffer.length > 0) {
      tokens.push({ type: "text", value: plainBuffer });
      plainBuffer = "";
    }
  };

  while (i < raw.length) {
    // --- IMAGE (Markdown):  ![alt](url) ---
    if (raw[i] === "!" && raw[i + 1] === "[") {
      const closeBracket = raw.indexOf("]", i + 2);
      if (closeBracket !== -1 && raw[closeBracket + 1] === "(") {
        const closeParen = raw.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flushPlain();
          const alt = raw.slice(i + 2, closeBracket);
          const url = raw.slice(closeBracket + 2, closeParen).trim();
          if (url) tokens.push({ type: "image", src: url, alt });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // --- IMAGE (bracket marker):  [img: url] or [image: url] ---
    if (raw[i] === "[") {
      const closeBracket = raw.indexOf("]", i + 1);
      if (closeBracket !== -1) {
        const inner = raw.slice(i + 1, closeBracket).trim();
        const markerMatch = inner.match(/^(?:img|image)\s*:\s*(.+)$/i);
        if (markerMatch) {
          flushPlain();
          const url = markerMatch[1].trim();
          if (url) tokens.push({ type: "image", src: url, alt: "" });
          i = closeBracket + 1;
          continue;
        }
      }
    }

    // --- BOLD (Markdown):  **text** ---
    if (raw[i] === "*" && raw[i + 1] === "*") {
      const close = raw.indexOf("**", i + 2);
      if (close !== -1) {
        flushPlain();
        const inner = raw.slice(i + 2, close);
        tokens.push({ type: "bold", value: inner });
        i = close + 2;
        continue;
      }
    }

    // --- ITALIC (Markdown):  *text*  (single asterisk, not part of **) ---
    if (raw[i] === "*" && raw[i + 1] !== "*") {
      const close = raw.indexOf("*", i + 1);
      if (close !== -1 && raw[close + 1] !== "*") {
        flushPlain();
        const inner = raw.slice(i + 1, close);
        tokens.push({ type: "italic", value: inner });
        i = close + 1;
        continue;
      }
    }

    // --- BOLD (HTML-ish):  <b>...</b> ---
    if (raw.slice(i, i + 3).toLowerCase() === "<b>") {
      const close = raw.toLowerCase().indexOf("</b>", i + 3);
      if (close !== -1) {
        flushPlain();
        const inner = raw.slice(i + 3, close);
        tokens.push({ type: "bold", value: inner });
        i = close + 4;
        continue;
      }
    }

    // --- BOLD (HTML-ish):  <strong>...</strong> ---
    if (raw.slice(i, i + 8).toLowerCase() === "<strong>") {
      const close = raw.toLowerCase().indexOf("</strong>", i + 8);
      if (close !== -1) {
        flushPlain();
        const inner = raw.slice(i + 8, close);
        tokens.push({ type: "bold", value: inner });
        i = close + 9;
        continue;
      }
    }

    // --- ITALIC (HTML-ish):  <i>...</i> ---
    if (raw.slice(i, i + 3).toLowerCase() === "<i>") {
      const close = raw.toLowerCase().indexOf("</i>", i + 3);
      if (close !== -1) {
        flushPlain();
        const inner = raw.slice(i + 3, close);
        tokens.push({ type: "italic", value: inner });
        i = close + 4;
        continue;
      }
    }

    // --- LINE BREAK ---
    if (raw[i] === "\n") {
      flushPlain();
      tokens.push({ type: "br" });
      i += 1;
      continue;
    }

    // --- Plain text (may still contain chemical subscripts) ---
    plainBuffer += raw[i];
    i += 1;
  }
  flushPlain();

  // Render each token. Text/bold/italic tokens still pass through the
  // chemical-subscript splitter so "H2O" inside **bold** still renders correctly.
  const renderInline = (value, keyPrefix) => {
    if (!value) return null;
    const parts = String(value).split(/(\d+)/g);
    return parts.map((part, idx) => {
      if (/^\d+$/.test(part)) {
        return (
          <sub key={`${keyPrefix}-sub-${idx}`} style={{ fontSize: "0.7em", lineHeight: 0 }}>
            {part}
          </sub>
        );
      }
      return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{part}</React.Fragment>;
    });
  };

  return (
    <span>
      {tokens.map((tok, idx) => {
        if (tok.type === "text") {
          return <React.Fragment key={`txt-${idx}`}>{renderInline(tok.value, `txt-${idx}`)}</React.Fragment>;
        }
        if (tok.type === "bold") {
          return (
            <strong key={`b-${idx}`} style={{ fontWeight: 700 }}>
              {renderInline(tok.value, `b-${idx}`)}
            </strong>
          );
        }
        if (tok.type === "italic") {
          return (
            <em key={`i-${idx}`} style={{ fontStyle: "italic" }}>
              {renderInline(tok.value, `i-${idx}`)}
            </em>
          );
        }
        if (tok.type === "br") {
          return <br key={`br-${idx}`} />;
        }
        if (tok.type === "image") {
          return (
            <span key={`img-${idx}`} style={{ display: "inline-block", margin: "6px 0" }}>
              <img
                src={tok.src}
                alt={tok.alt || "diagram"}
                loading="lazy"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 8,
                  display: "block",
                }}
                onError={(e) => {
                  // Fail gracefully: hide the broken image, show a small fallback.
                  e.currentTarget.style.display = "none";
                }}
              />
            </span>
          );
        }
        return null;
      })}
    </span>
  );
}