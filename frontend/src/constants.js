export const EDUCATION_LEVELS = ["primary", "junior", "senior"];

export const SENIOR_TRACKS = ["science", "humanities_business"];

export const SENIOR_CORE_SUBJECTS = [
  "mathematics",
  "english",
  "digital_technologies",
  "citizenship_heritage",
];

export const SENIOR_TRACK_SUBJECTS = {
  science: [
    "chemistry",
    "physics",
    "biology",
    "agricultural_science",
    "further_mathematics",
  ],
  humanities_business: [
    "economics",
    "government",
    "literature",
    "history",
    "crs_irs",
  ],
};

export const SUBJECTS_BY_LEVEL = {
  primary: ["mathematics", "english", "general_science"],
  junior: [
    "mathematics",
    "english",
    "intermediate_science",
    "biology",
    "chemistry",
    "physics",
    "citizenship_heritage",
  ],
  senior: [
    ...SENIOR_CORE_SUBJECTS,
    ...SENIOR_TRACK_SUBJECTS.science,
    ...SENIOR_TRACK_SUBJECTS.humanities_business,
  ],
};

export const EXAM_TARGETS_BY_LEVEL = {
  primary: ["common_entrance"],
  junior: ["bece", "IGCSE"],
  senior: ["jamb", "waec", "neco", "gce", "IGCSE", "ssce"],
};

export const ALL_EXAM_TARGETS = [
  "common_entrance",
  "bece",
  "IGCSE",
  "jamb",
  "waec",
  "neco",
  "gce",
  "ssce",
];

export const SUBJECT_LABELS = {
  mathematics: "Mathematics",
  english: "English",
  general_science: "General Science",
  intermediate_science: "Intermediate Science",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  agricultural_science: "Agricultural Science",
  further_mathematics: "Further Mathematics",
  economics: "Economics",
  government: "Government",
  literature: "Literature",
  history: "History",
  crs_irs: "CRS / IRS",
  digital_technologies: "Digital Technologies",
  citizenship_heritage: "Citizenship & Heritage Studies",
  mixed: "Mixed Subjects",
};

export const LEVEL_LABELS = {
  primary: "Upper Primary",
  junior: "Junior Secondary",
  senior: "Senior Secondary",
};

export const SENIOR_TRACK_LABELS = {
  science: "Science",
  humanities_business: "Humanities / Business",
};

export const EXAM_TARGET_LABELS = {
  common_entrance: "Common Entrance",
  bece: "BECE",
  IGCSE: "IGCSE",
  jamb: "JAMB",
  waec: "WAEC",
  neco: "NECO",
  gce: "GCE",
  ssce: "SSCE",
};

export const ALL_SUBJECTS = [
  "mathematics",
  "english",
  "general_science",
  "intermediate_science",
  "biology",
  "chemistry",
  "physics",
  "agricultural_science",
  "further_mathematics",
  "economics",
  "government",
  "literature",
  "history",
  "crs_irs",
  "digital_technologies",
  "citizenship_heritage",
  "mixed",
];

// ==========================================
// LIGHT PAPER RENDER MODES
// ==========================================
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