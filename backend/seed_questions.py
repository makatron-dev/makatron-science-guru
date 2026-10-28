from database import SessionLocal
import models

db = SessionLocal()

if db.query(models.Question).filter(models.Question.education_level == "senior", models.Question.subject == "biology").count() > 0:
    print("Senior Biology questions already exist — skipping seed")
    db.close()
    raise SystemExit

Q = [
    ("biology", "Cell Biology", "easy", "Which organelle is known as the powerhouse of the cell?", "Nucleus", "Mitochondrion", "Ribosome", "Golgi apparatus", "B", "Mitochondria produce ATP through cellular respiration."),
    ("biology", "Cell Biology", "easy", "What is the basic unit of life?", "Atom", "Cell", "Molecule", "Tissue", "B", "The cell is the smallest unit that can carry out all life processes."),
    ("biology", "Genetics", "medium", "Who is known as the father of genetics?", "Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Robert Hooke", "B", "Mendel's work on pea plants established the laws of inheritance."),
    ("biology", "Genetics", "medium", "What molecule carries genetic information?", "RNA", "DNA", "Protein", "Lipid", "B", "DNA stores hereditary information in its nucleotide sequence."),
    ("biology", "Photosynthesis", "easy", "Which pigment gives plants their green colour?", "Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin", "B", "Chlorophyll absorbs light for photosynthesis and reflects green wavelengths."),
    ("biology", "Photosynthesis", "medium", "Where does photosynthesis take place?", "Mitochondria", "Chloroplast", "Nucleus", "Ribosome", "B", "Chloroplasts contain chlorophyll and are the site of photosynthesis."),
    ("biology", "Respiration", "easy", "Which gas do humans breathe out?", "Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen", "C", "Cellular respiration produces CO2 as a waste product."),
    ("biology", "Respiration", "medium", "Aerobic respiration requires which gas?", "Nitrogen", "Oxygen", "Helium", "Methane", "B", "Aerobic means 'with oxygen' — oxygen is the final electron acceptor."),
    ("biology", "Human Body", "easy", "How many bones are in the adult human body?", "186", "206", "226", "246", "B", "An adult human has 206 bones."),
    ("biology", "Human Body", "easy", "Which organ pumps blood around the body?", "Liver", "Heart", "Lungs", "Kidney", "B", "The heart is a muscular pump that circulates blood."),
    ("biology", "Human Body", "medium", "What is the largest organ of the human body?", "Liver", "Skin", "Brain", "Lungs", "B", "The skin is the largest organ, covering the entire body."),
    ("biology", "Ecology", "easy", "What do we call organisms that make their own food?", "Consumers", "Producers", "Decomposers", "Predators", "B", "Producers (like plants) make food via photosynthesis."),
    ("biology", "Ecology", "medium", "What is a food chain?", "A cycle of water", "A sequence showing energy flow", "A type of cell", "A hormone", "B", "A food chain shows the transfer of energy between organisms."),
    ("biology", "Reproduction", "medium", "Where does fertilisation normally occur in humans?", "Uterus", "Ovary", "Fallopian tube", "Vagina", "C", "Fertilisation typically occurs in the fallopian tube."),
    ("biology", "Reproduction", "easy", "What is the male sex cell called?", "Ovum", "Sperm", "Zygote", "Embryo", "B", "The sperm is the male gamete."),
    ("biology", "Classification", "medium", "Which kingdom do mushrooms belong to?", "Plantae", "Animalia", "Fungi", "Protista", "C", "Fungi are a separate kingdom — they don't photosynthesise."),
    ("biology", "Classification", "easy", "Which of these is a vertebrate?", "Earthworm", "Snail", "Frog", "Jellyfish", "C", "Frogs have a backbone — they're vertebrates."),
    ("biology", "Transport", "medium", "What tissue transports water in plants?", "Phloem", "Xylem", "Cambium", "Cortex", "B", "Xylem carries water and minerals from roots to leaves."),
    ("biology", "Transport", "medium", "What tissue transports food in plants?", "Xylem", "Phloem", "Epidermis", "Pith", "B", "Phloem transports sugars made during photosynthesis."),
    ("biology", "Nutrition", "easy", "Which vitamin is produced when skin is exposed to sunlight?", "Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D", "D", "Sunlight triggers Vitamin D synthesis in the skin."),
    ("biology", "Nutrition", "medium", "Which nutrient is the body's main source of energy?", "Protein", "Carbohydrates", "Vitamins", "Minerals", "B", "Carbohydrates are broken down into glucose for energy."),
    ("biology", "Excretion", "medium", "Which organ filters waste from the blood?", "Liver", "Kidney", "Spleen", "Pancreas", "B", "Kidneys filter blood and produce urine."),
    ("biology", "Excretion", "easy", "What is the main nitrogenous waste in human urine?", "Ammonia", "Urea", "Uric acid", "Creatine", "B", "Urea is the main nitrogenous waste in humans."),
    ("biology", "Nervous System", "medium", "What is the basic unit of the nervous system?", "Neuron", "Axon", "Synapse", "Ganglion", "A", "The neuron (nerve cell) is the basic functional unit."),
    ("biology", "Nervous System", "easy", "Which organ controls the nervous system?", "Heart", "Brain", "Liver", "Lungs", "B", "The brain is the control centre of the nervous system."),
]

for subj, topic, diff, text, a, b, c, d, correct, expl in Q:
    db.add(models.Question(
        education_level="senior", subject=subj, exam_target=None,
        topic=topic, difficulty=diff, question_text=text,
        option_a=a, option_b=b, option_c=c, option_d=d,
        correct_option=correct, explanation=expl, is_active=True,
    ))
db.commit()
print(f"Seeded {len(Q)} senior biology questions.")
db.close()
