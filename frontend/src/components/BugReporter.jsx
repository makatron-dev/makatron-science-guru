import React, { useEffect, useRef, useState } from "react";
import { api, getToken } from "../api.js";

export default function BugReporter({ isOpen, onClose }) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const textareaRef = useRef(null);
  const closeTimerRef = useRef(null);

  // A stable snapshot of browser info, captured once per session.
  const browserInfoRef = useRef(null);
  if (browserInfoRef.current === null) {
    try {
      const nav = typeof navigator !== "undefined" ? navigator : {};
      const scr = typeof window !== "undefined" && window.screen ? window.screen : {};
      browserInfoRef.current = [
        nav.userAgent || "unknown",
        `lang=${nav.language || "?"}`,
        `screen=${scr.width || "?"}x${scr.height || "?"}`,
        `viewport=${window?.innerWidth || "?"}x${window?.innerHeight || "?"}`,
      ].join(" | ");
    } catch {
      browserInfoRef.current = "unknown";
    }
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // ESC to close + focus management
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) closeModal();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => textareaRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, submitting]);

  const resetState = () => {
    setDescription("");
    setError("");
    setSuccess(false);
    setSubmitting(false);
  };

  const closeModal = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (onClose) onClose();
    setTimeout(resetState, 200);
  };

  const handleSubmit = async () => {
    const trimmed = description.trim();
    if (trimmed.length < 4) {
      setError("Please describe the bug in at least 4 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.reportBug({
        description: trimmed,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        browser_info: browserInfoRef.current,
      });
      setSuccess(true);
      closeTimerRef.current = setTimeout(() => {
        closeModal();
      }, 1400);
    } catch (e) {
      setError(e?.message || "Could not submit the report. Please try again.");
      setSubmitting(false);
    }
  };

  if (!isOpen || !getToken()) return null;

  return (
    <div
      style={backdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) closeModal();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label="Report a bug" style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <div style={titleStyle}>
              <span aria-hidden="true" style={{ marginRight: 8 }}>🐛</span>
              Report a Bug
            </div>
            <div style={subtitleStyle}>
              Found something broken? Let us know. We read every report.
            </div>
          </div>
          <button type="button" onClick={closeModal} disabled={submitting} aria-label="Close" style={closeBtnStyle}>
            ✕
          </button>
        </div>

        {success ? (
          <div style={successStyle}>
            <span aria-hidden="true" style={{ marginRight: 8 }}>✅</span>
            Thanks! Your report was submitted. We'll take it from here.
          </div>
        ) : (
          <>
            <label style={labelStyle} htmlFor="bug-description">
              What went wrong?
            </label>
            <textarea
              id="bug-description"
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. 'The timer froze on question 5' or 'The answer for Q14 in Biology Mock looks wrong.'"
              rows={5}
              maxLength={2000}
              disabled={submitting}
              style={textareaStyle}
            />
            <div style={counterStyle}>{description.length}/2000</div>

            <div style={metaRowStyle}>
              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>Page</div>
                <div style={metaValueStyle} title={typeof window !== "undefined" ? window.location.href : ""}>
                  {typeof window !== "undefined" ? window.location.href : "—"}
                </div>
              </div>
              <div style={metaBlockStyle}>
                <div style={metaLabelStyle}>Browser</div>
                <div style={metaValueStyle} title={browserInfoRef.current || ""}>
                  {browserInfoRef.current || "—"}
                </div>
              </div>
            </div>

            {error && (
              <div style={errorStyle}>
                <span aria-hidden="true" style={{ marginRight: 8 }}>⚠️</span>
                {error}
              </div>
            )}

            <div style={actionsStyle}>
              <button type="button" onClick={closeModal} disabled={submitting} style={cancelBtnStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || description.trim().length < 4}
                style={{
                  ...submitBtnStyle,
                  opacity: submitting || description.trim().length < 4 ? 0.55 : 1,
                  cursor: submitting || description.trim().length < 4 ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Sending…" : "Send Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Styles remain exactly the same as your file, but WITHOUT the triggerStyle and bugIconStyle */
const backdropStyle = { position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const modalStyle = { width: "100%", maxWidth: 560, background: "var(--mk-bg-elev)", color: "var(--mk-text)", border: "1px solid var(--mk-border)", borderRadius: 16, padding: 24, boxShadow: "0 0 0 1px var(--mk-accent), 0 30px 60px rgba(0, 0, 0, 0.45)" };
const headerStyle = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 };
const titleStyle = { fontSize: "1.15rem", fontWeight: 800, letterSpacing: 0.2 };
const subtitleStyle = { fontSize: "0.85rem", color: "var(--mk-text-dim)", marginTop: 4, lineHeight: 1.4 };
const closeBtnStyle = { background: "transparent", border: "1px solid var(--mk-border)", color: "var(--mk-text)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 14, lineHeight: 1 };
const labelStyle = { display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--mk-text-dim)", marginBottom: 8, letterSpacing: 0.4, textTransform: "uppercase" };
const textareaStyle = { width: "100%", minHeight: 120, padding: 12, borderRadius: 10, border: "1px solid var(--mk-border)", background: "var(--mk-bg)", color: "var(--mk-text)", fontFamily: "inherit", fontSize: "0.95rem", lineHeight: 1.5, resize: "vertical", outline: "none", boxSizing: "border-box" };
const counterStyle = { fontSize: "0.75rem", color: "var(--mk-text-dim)", textAlign: "right", marginTop: 4, marginBottom: 14 };
const metaRowStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 };
const metaBlockStyle = { background: "var(--mk-bg)", border: "1px solid var(--mk-border)", borderRadius: 8, padding: "8px 10px", minWidth: 0 };
const metaLabelStyle = { fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.6, color: "var(--mk-text-dim)", textTransform: "uppercase", marginBottom: 2 };
const metaValueStyle = { fontSize: "0.78rem", color: "var(--mk-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const errorStyle = { background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "#fecaca", borderRadius: 10, padding: "10px 12px", fontSize: "0.85rem", marginBottom: 14 };
const successStyle = { background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.5)", color: "#bbf7d0", borderRadius: 10, padding: "14px 16px", fontSize: "0.95rem", lineHeight: 1.5 };
const actionsStyle = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 };
const cancelBtnStyle = { background: "transparent", border: "1px solid var(--mk-border)", color: "var(--mk-text)", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 };
const submitBtnStyle = { background: "var(--mk-accent)", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 800, letterSpacing: 0.3 };