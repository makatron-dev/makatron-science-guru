EDUCATION_LEVELS = ("primary", "junior", "senior")

# Senior tracks
SENIOR_TRACKS = ("science", "humanities_business")

SENIOR_CORE_SUBJECTS = (
    "mathematics",
    "english",
    "digital_technologies",
    "citizenship_heritage",
)

SENIOR_TRACK_SUBJECTS = {
    "science": (
        "chemistry",
        "physics",
        "biology",
        "agricultural_science",
        "further_mathematics",
    ),
    "humanities_business": (
        "economics",
        "government",
        "literature",
        "history",
        "crs_irs",
    ),
}

SUBJECTS_BY_LEVEL = {
    "primary": ("mathematics", "english", "general_science"),
    "junior": (
        "mathematics",
        "english",
        "intermediate_science",
        "biology",
        "chemistry",
        "physics",
        "citizenship_heritage",
    ),
    "senior": SENIOR_CORE_SUBJECTS
    + SENIOR_TRACK_SUBJECTS["science"]
    + SENIOR_TRACK_SUBJECTS["humanities_business"],
}

# NOTE: "mixed" is included in ALL_SUBJECTS but NOT in SUBJECTS_BY_LEVEL.
ALL_SUBJECTS = (
    # Primary
    "mathematics",
    "english",
    "general_science",
    # Junior
    "intermediate_science",
    # Science
    "biology",
    "chemistry",
    "physics",
    "agricultural_science",
    "further_mathematics",
    # Humanities/Business
    "economics",
    "government",
    "literature",
    "history",
    "crs_irs",
    # Shared
    "digital_technologies",
    "citizenship_heritage",
    # Admin-only
    "mixed",
)

EXAM_TARGETS_BY_LEVEL = {
    "primary": ("common_entrance",),
    "junior": ("bece", "IGCSE"),
    "senior": ("jamb", "waec", "neco", "gce", "IGCSE", "ssce"),
}

ALL_EXAM_TARGETS = (
    "common_entrance",
    "bece",
    "IGCSE",
    "jamb",
    "waec",
    "neco",
    "gce",
    "ssce",
)

DIFFICULTIES = ("easy", "medium", "hard")

SUBJECT_LABELS = {
    "mathematics": "Mathematics",
    "english": "English",
    "general_science": "General Science",
    "intermediate_science": "Intermediate Science",
    "biology": "Biology",
    "chemistry": "Chemistry",
    "physics": "Physics",
    "agricultural_science": "Agricultural Science",
    "further_mathematics": "Further Mathematics",
    "economics": "Economics",
    "government": "Government",
    "literature": "Literature",
    "history": "History",
    "crs_irs": "CRS / IRS",
    "digital_technologies": "Digital Technologies",
    "citizenship_heritage": "Citizenship & Heritage Studies",
    "mixed": "Mixed Subjects",
}

LEVEL_LABELS = {
    "primary": "Upper Primary",
    "junior": "Junior Secondary",
    "senior": "Senior Secondary",
}

SENIOR_TRACK_LABELS = {
    "science": "Science",
    "humanities_business": "Humanities / Business",
}

EXAM_TARGET_LABELS = {
    "common_entrance": "Common Entrance",
    "bece": "BECE",
    "IGCSE": "IGCSE",
    "jamb": "JAMB",
    "waec": "WAEC",
    "neco": "NECO",
    "gce": "GCE",
    "ssce": "SSCE",
}