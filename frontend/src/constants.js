export const EDUCATION_LEVELS = ["primary", "junior", "senior"];

export const SUBJECTS_BY_LEVEL = {
  primary: ["general_science"],
  junior: ["intermediate_science", "biology", "chemistry", "physics"],
  senior: ["biology", "chemistry", "physics"],
};

export const EXAM_TARGETS_BY_LEVEL = {
  primary: ["primary_school"],
  junior: ["junior_school", "bece", "IGCSE"],
  senior: ["senior_school", "waec", "jamb", "IGCSE"],
};

export const ALL_EXAM_TARGETS = ["primary_school", "junior_school", "bece", "senior_school", "waec", "jamb", "IGCSE"];

export const SUBJECT_LABELS = {
  general_science: "General Science",
  intermediate_science: "Intermediate Science",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  mixed: "Mixed Subjects",
};

export const LEVEL_LABELS = {
  primary: "Upper Primary",
  junior: "Junior Secondary",
  senior: "Senior Secondary",
};

export const EXAM_TARGET_LABELS = {
  primary_school: "Primary School Exams",
  junior_school: "Junior School Exams",
  bece: "BECE",
  senior_school: "Senior School Exams",
  waec: "WAEC",
  jamb: "JAMB",
  IGCSE: "IGCSE",
};

export const ALL_SUBJECTS = ["general_science", "intermediate_science", "biology", "chemistry", "physics"];

// ==========================================
// LIGHT PAPER RENDER MODES
// ==========================================
// Question cards flip to "Light Paper" mode when the question has an image
// or a passage attached. These exports give the renderer a single source of
// truth instead of scattering the literal string "light_paper" everywhere.
//
// Usage in a component:
//   import { IMAGE_RENDER_MODES, questionNeedsLightPaper } from "../constants";
//   const mode = questionNeedsLightPaper(q) ? IMAGE_RENDER_MODES.LIGHT_PAPER : IMAGE_RENDER_MODES.DARK;
//
// "DARK" mode is the default glass-morphism card styling.
// "LIGHT_PAPER" mode is the off-white, dark-text card used for questions
// with an image or a comprehension passage.

export const IMAGE_RENDER_MODES = {
  DARK: "dark",
  LIGHT_PAPER: "light_paper",
};

export function questionNeedsLightPaper(question) {
  if (!question) return false;
  const hasImage =
    typeof question.image_url === "string" && question.image_url.trim().length > 0;
  const hasPassage =
    (question.passage &&
      typeof question.passage.content === "string" &&
      question.passage.content.trim().length > 0) ||
    question.passage_id != null;
  return hasImage || hasPassage;
}