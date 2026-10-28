EDUCATION_LEVELS = ("primary", "junior", "senior")

SUBJECTS_BY_LEVEL = {
    "primary": ("general_science",),
    "junior": ("intermediate_science", "biology", "chemistry", "physics"),
    "senior": ("biology", "chemistry", "physics"),
}

# NOTE: "mixed" is included in ALL_SUBJECTS but NOT in SUBJECTS_BY_LEVEL.
# "mixed" is a valid subject for admin-created exams and their question bank,
# but it is NOT a subject a student may select. Keep it out of SUBJECTS_BY_LEVEL.
ALL_SUBJECTS = ("general_science", "intermediate_science", "biology", "chemistry", "physics", "mixed")

EXAM_TARGETS_BY_LEVEL = {
    "primary": ("primary_school",),
    "junior": ("junior_school", "bece", "IGCSE"),
    "senior": ("senior_school", "waec", "jamb", "IGCSE"),
}

ALL_EXAM_TARGETS = ("primary_school", "junior_school", "bece", "senior_school", "waec", "jamb", "IGCSE")

DIFFICULTIES = ("easy", "medium", "hard")

SUBJECT_LABELS = {
    "general_science": "General Science",
    "intermediate_science": "Intermediate Science",
    "biology": "Biology",
    "chemistry": "Chemistry",
    "physics": "Physics",
    "mixed": "Mixed Subjects",
}

LEVEL_LABELS = {
    "primary": "Upper Primary",
    "junior": "Junior Secondary",
    "senior": "Senior Secondary",
}

EXAM_TARGET_LABELS = {
    "primary_school": "Primary School Exams",
    "junior_school": "Junior School Exams",
    "bece": "BECE",
    "senior_school": "Senior School Exams",
    "waec": "WAEC",
    "jamb": "JAMB",
    "IGCSE": "IGCSE",
}