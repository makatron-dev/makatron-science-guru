import React from "react";
import ChemText from "../ChemText.jsx";
import { questionNeedsLightPaper } from "../constants.js";

export default function QuestionRenderer({ question, selectedOption, onSelectOption }) {
  if (!question) return null;

  // Light Paper mode triggers when the question has a diagram OR a comprehension passage.
  // A single source-of-truth helper (constants.js) keeps every caller in sync.
  const lightPaper = questionNeedsLightPaper(question);

  // Passage can arrive in two shapes:
  //   1. question.passage = { title, content, ... }   (nested, from QuestionOut.passage)
  //   2. question.passage_id = 42 (id only)            (fallback, no content available)
  const passageContent =
    question.passage && typeof question.passage.content === "string" && question.passage.content.trim().length > 0
      ? question.passage.content
      : null;
  const passageTitle =
    question.passage && typeof question.passage.title === "string" && question.passage.title.trim().length > 0
      ? question.passage.title
      : null;
  const hasPassage = !!passageContent;

  const hasImage = !!question.image_url;

  // ---------- Card shell ----------
  const containerStyle = lightPaper
    ? {
        background: "#fbfaf6", // warm off-white "paper"
        border: "1px solid #e5e2d6",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 24,
        color: "#1f2937",
        boxShadow: "0 4px 10px -2px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
      }
    : {
        background: "var(--mk-bg-elev)",
        border: "1px solid var(--mk-border)",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 24,
        color: "var(--mk-text)",
        boxShadow: "var(--mk-shadow)",
        transition: "all 0.3s ease",
      };

  // ---------- Passage panel ----------
  const passagePanelStyle = {
    marginBottom: 20,
    padding: "18px 20px 18px 22px",
    borderLeft: "3px solid #c8b76a",
    background: "#ffffff",
    borderRadius: 8,
    color: "#1f2937",
    fontFamily: "'Georgia', 'Iowan Old Style', 'Charter', serif",
    fontSize: "1rem",
    lineHeight: 1.7,
    boxShadow: "inset 0 0 0 1px #efece2",
  };
  const passageTitleStyle = {
    fontFamily: "'Georgia', serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#8b7a2e",
    marginBottom: 10,
  };
  const passageBodyStyle = {
    whiteSpace: "pre-wrap",
    margin: 0,
  };

  // ---------- Image ----------
  const imageWrapStyle = { marginBottom: 20 };
  const imageStyle = {
    maxWidth: "100%",
    height: "auto",
    borderRadius: 8,
    display: "block",
    margin: "0 auto",
    border: lightPaper ? "1px solid #e5e7eb" : "1px solid var(--mk-border)",
  };

  // ---------- Question text ----------
  const textStyle = {
    fontSize: "1.1rem",
    fontWeight: 600,
    lineHeight: 1.6,
    marginBottom: lightPaper ? 24 : 20,
    color: lightPaper ? "#111827" : "var(--mk-text)",
  };

  // ---------- Options ----------
  const optionStyle = (isSelected) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px",
    borderRadius: 8,
    cursor: "pointer",
    border: isSelected
      ? "2px solid var(--mk-accent)"
      : lightPaper
      ? "1px solid #e5e7eb"
      : "1px solid var(--mk-border)",
    background: isSelected
      ? lightPaper
        ? "rgba(0, 212, 255, 0.10)"
        : "rgba(0, 212, 255, 0.15)"
      : lightPaper
      ? "#ffffff"
      : "var(--mk-bg)",
    color: lightPaper ? "#374151" : "var(--mk-text)",
    transition: "all 0.2s ease",
    marginBottom: 10,
  });

  const bubbleStyle = (isSelected) => ({
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
    background: isSelected
      ? "var(--mk-accent)"
      : lightPaper
      ? "#e5e7eb"
      : "var(--mk-bg-elev-2)",
    color: isSelected
      ? "#000"
      : lightPaper
      ? "#4b5563"
      : "var(--mk-text-dim)",
  });

  // ---------- Render ----------
  return (
    <div style={containerStyle}>
      {hasPassage && (
        <div style={passagePanelStyle}>
          {passageTitle && <div style={passageTitleStyle}>{passageTitle}</div>}
          <p style={passageBodyStyle}>{passageContent}</p>
        </div>
      )}

      {hasImage && (
        <div style={imageWrapStyle}>
          <img
            src={question.image_url}
            alt="Question Diagram"
            style={imageStyle}
            loading="lazy"
            onError={(e) => {
              // Fail gracefully if the image URL is dead.
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div style={textStyle}>
        <ChemText text={question.question_text} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {question.options.map((opt) => (
          <div
            key={opt.letter}
            onClick={() => onSelectOption(opt.letter)}
            style={optionStyle(selectedOption === opt.letter)}
            onMouseEnter={(e) => {
              if (selectedOption !== opt.letter) {
                e.currentTarget.style.background = lightPaper
                  ? "#f3f4f6"
                  : "var(--mk-bg-elev-2)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedOption !== opt.letter) {
                e.currentTarget.style.background = lightPaper
                  ? "#ffffff"
                  : "var(--mk-bg)";
              }
            }}
          >
            <div style={bubbleStyle(selectedOption === opt.letter)}>
              {opt.letter}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 500 }}>
              <ChemText text={opt.text} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}