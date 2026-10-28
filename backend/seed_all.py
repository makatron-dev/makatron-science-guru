"""Full seed: SubjectConfigs + questions for every level/subject combination."""
from database import SessionLocal
import models

db = SessionLocal()

# ---------- Subject configs ----------
CONFIGS = [
    # (subject, level, q_count, duration_s, marks, penalty, min_lb, practice/day, mock/week)
    ("general_science", "primary", 15, 900, 1, 0, 15, 3, 3),
    ("intermediate_science", "junior", 20, 1200, 1, 0, 20, 3, 3),
    ("biology", "junior", 20, 1200, 1, 0, 20, 3, 3),
    ("chemistry", "junior", 20, 1200, 1, 0, 20, 3, 3),
    ("physics", "junior", 20, 1200, 1, 0, 20, 3, 3),
    ("biology", "senior", 20, 1200, 1, 0, 20, 3, 3),
    ("chemistry", "senior", 20, 1200, 1, 0, 20, 3, 3),
    ("physics", "senior", 20, 1200, 1, 0, 20, 3, 3),
]

for subj, lvl, qc, dur, marks, pen, min_lb, pdl, mwl in CONFIGS:
    row = db.query(models.SubjectConfig).filter(
        models.SubjectConfig.subject == subj,
        models.SubjectConfig.education_level == lvl,
    ).first()
    if row:
        row.question_count = qc
        row.duration_seconds = dur
        row.marks_per_correct = marks
        row.penalty_per_wrong = pen
        row.min_questions_for_leaderboard = min_lb
        row.practice_daily_limit = pdl
        row.mock_weekly_limit = mwl
    else:
        db.add(models.SubjectConfig(
            subject=subj, education_level=lvl,
            question_count=qc, duration_seconds=dur,
            marks_per_correct=marks, penalty_per_wrong=pen,
            min_questions_for_leaderboard=min_lb,
            practice_daily_limit=pdl, mock_weekly_limit=mwl,
        ))
db.commit()
print(f"Subject configs: {len(CONFIGS)} rows")

# ---------- Questions ----------
# Format: (level, subject, exam_target, topic, difficulty, question, a, b, c, d, correct, explanation)

GENERAL = [
    ("primary", "general_science", None, "Living Things", "easy", "Which of these is a living thing?", "Stone", "Mango tree", "Water", "Chair", "B", "A mango tree grows, breathes and reproduces — it is alive."),
    ("primary", "general_science", None, "Living Things", "easy", "Which of these is NOT a living thing?", "Dog", "Grass", "Bicycle", "Fish", "C", "A bicycle cannot grow, feed, or reproduce."),
    ("primary", "general_science", None, "Plants", "easy", "What do plants need to make their food?", "Sunlight, water and air", "Only sand", "Only stones", "Only darkness", "A", "Plants use sunlight, water and carbon dioxide to make food."),
    ("primary", "general_science", None, "Plants", "easy", "Which part of a plant absorbs water from the soil?", "Leaf", "Flower", "Root", "Stem", "C", "Roots absorb water and minerals from the soil."),
    ("primary", "general_science", None, "Animals", "easy", "Which of these animals lives in water?", "Goat", "Fish", "Lion", "Hen", "B", "Fish live in water and breathe through gills."),
    ("primary", "general_science", None, "Animals", "easy", "How many legs does an insect have?", "2", "4", "6", "8", "C", "Insects have six legs."),
    ("primary", "general_science", None, "Human Body", "easy", "Which organ do we use to see?", "Ear", "Eye", "Nose", "Tongue", "B", "The eyes are the organs of sight."),
    ("primary", "general_science", None, "Human Body", "easy", "How many fingers does a normal person have on both hands?", "5", "8", "10", "12", "C", "A person has five fingers on each hand — ten in total."),
    ("primary", "general_science", None, "Weather", "easy", "What do we use an umbrella for?", "Sun only", "Rain only", "Rain and sun", "Nothing", "C", "An umbrella protects us from both rain and strong sun."),
    ("primary", "general_science", None, "Weather", "easy", "Which of these is a source of light during the day?", "Moon", "Sun", "Candle", "Torch", "B", "The Sun is the natural source of light during the day."),
    ("primary", "general_science", None, "Water", "easy", "What happens to water when it is heated?", "It freezes", "It becomes steam", "It becomes stone", "Nothing", "B", "Heated water changes to steam (water vapour)."),
    ("primary", "general_science", None, "Water", "medium", "Which of these is the correct order of the water cycle?", "Rain → evaporation → condensation", "Evaporation → condensation → rain", "Condensation → rain → evaporation", "Rain → condensation → evaporation", "B", "Water evaporates, condenses into clouds, then falls as rain."),
    ("primary", "general_science", None, "Food", "easy", "Which of these is a fruit?", "Carrot", "Orange", "Cabbage", "Potato", "B", "An orange is a fruit — it contains seeds and grows from a flower."),
    ("primary", "general_science", None, "Food", "easy", "Which food helps build strong bones and teeth?", "Sweets", "Milk", "Chocolate", "Chips", "B", "Milk is rich in calcium which builds strong bones."),
    ("primary", "general_science", None, "Air", "medium", "Which gas do humans need to breathe in to stay alive?", "Carbon dioxide", "Oxygen", "Nitrogen", "Helium", "B", "Humans need oxygen for respiration."),
    ("primary", "general_science", None, "Air", "easy", "What do we call moving air?", "Rain", "Wind", "Sun", "Smoke", "B", "Moving air is called wind."),
    ("primary", "general_science", None, "Health", "easy", "How often should you brush your teeth?", "Once a month", "Once a week", "Twice a day", "Never", "C", "Brushing twice daily keeps teeth healthy."),
    ("primary", "general_science", None, "Health", "medium", "Which of these is a good hygiene habit?", "Sharing toothbrushes", "Washing hands before eating", "Eating with dirty hands", "Drinking dirty water", "B", "Washing hands before eating prevents disease."),
    ("primary", "general_science", None, "Safety", "easy", "What should you do when the traffic light is red?", "Cross quickly", "Wait", "Run", "Skip", "B", "Red means stop and wait."),
    ("primary", "general_science", None, "Safety", "easy", "Which of these is dangerous to play with?", "Ball", "Matches", "Kite", "Rope", "B", "Matches can start fires — never play with them."),
    ("primary", "general_science", None, "Materials", "medium", "Which of these materials is attracted to a magnet?", "Wood", "Iron nail", "Plastic", "Paper", "B", "Iron is magnetic."),
    ("primary", "general_science", None, "Materials", "easy", "Which of these is transparent?", "Wood", "Clear glass", "Stone", "Iron", "B", "Clear glass allows light through — it is transparent."),
    ("primary", "general_science", None, "Energy", "easy", "What is the main source of energy for the Earth?", "Moon", "Sun", "Wind", "Rain", "B", "The Sun provides nearly all energy on Earth."),
    ("primary", "general_science", None, "Energy", "medium", "Which of these is a form of energy?", "Heat", "Stone", "Wood", "Sand", "A", "Heat is a form of energy."),
    ("primary", "general_science", None, "Earth", "easy", "What is the shape of the Earth?", "Flat", "Round (sphere)", "Square", "Triangle", "B", "The Earth is roughly spherical."),
    ("primary", "general_science", None, "Earth", "easy", "How many days are in a week?", "5", "6", "7", "8", "C", "A week has seven days."),
    ("primary", "general_science", None, "Earth", "medium", "What causes day and night?", "The Moon moving", "The Earth spinning on its axis", "The Sun moving", "Clouds", "B", "The Earth's rotation causes day and night."),
    ("primary", "general_science", None, "Sound", "medium", "Which of these produces sound?", "A silent stone", "A vibrating drum", "A still book", "A sleeping cat", "B", "Sound is produced by vibration."),
    ("primary", "general_science", None, "Simple Machines", "medium", "A wheel and axle is an example of what?", "A toy", "A simple machine", "A chemical", "A plant", "B", "Wheel and axle is one of the simple machines."),
    ("primary", "general_science", None, "Simple Machines", "medium", "Which simple machine is used to lift water from a well?", "Pulley", "Wedge", "Screw", "Inclined plane", "A", "A pulley makes lifting easier."),
]

JUNIOR = [
    ("junior", "intermediate_science", None, "Matter", "easy", "Which state of matter has a fixed shape and volume?", "Solid", "Liquid", "Gas", "Plasma", "A", "Solids have fixed shape and volume."),
    ("junior", "intermediate_science", None, "Matter", "easy", "Which of these is a physical change?", "Burning wood", "Melting ice", "Rusting iron", "Baking cake", "B", "Melting ice is a physical change — no new substance forms."),
    ("junior", "intermediate_science", None, "Matter", "medium", "What is the process by which a solid changes directly to gas?", "Evaporation", "Sublimation", "Condensation", "Melting", "B", "Sublimation: solid → gas without passing through liquid."),
    ("junior", "intermediate_science", None, "Matter", "medium", "Which of these has the lowest density?", "Iron", "Water", "Air", "Mercury", "C", "Air has the lowest density of the options."),
    ("junior", "intermediate_science", None, "Energy", "easy", "Which of these is a renewable source of energy?", "Coal", "Petroleum", "Solar", "Natural gas", "C", "Solar energy is renewable."),
    ("junior", "intermediate_science", None, "Energy", "medium", "What is the SI unit of energy?", "Newton", "Joule", "Watt", "Pascal", "B", "The joule (J) is the SI unit of energy."),
    ("junior", "intermediate_science", None, "Energy", "medium", "Which of these converts electrical energy to light energy?", "Electric bulb", "Electric fan", "Radio", "Kettle", "A", "A bulb converts electrical energy to light (and heat)."),
    ("junior", "intermediate_science", None, "Force", "easy", "What is the SI unit of force?", "Joule", "Newton", "Watt", "Pascal", "B", "Force is measured in newtons."),
    ("junior", "intermediate_science", None, "Force", "medium", "Which of these is a contact force?", "Gravity", "Magnetic force", "Friction", "Electrostatic force", "C", "Friction is a contact force — surfaces must touch."),
    ("junior", "intermediate_science", None, "Force", "medium", "What is the force that pulls objects toward the Earth?", "Magnetism", "Friction", "Gravity", "Tension", "C", "Gravity pulls objects toward Earth's centre."),
    ("junior", "intermediate_science", None, "Living Things", "easy", "What is the basic unit of life?", "Atom", "Cell", "Molecule", "Organ", "B", "The cell is the basic unit of life."),
    ("junior", "intermediate_science", None, "Living Things", "easy", "Which of these is a characteristic of all living things?", "They never change", "They reproduce", "They are made of metal", "They cannot move", "B", "Reproduction is a defining characteristic of life."),
    ("junior", "intermediate_science", None, "Living Things", "medium", "Which organelle controls the activities of the cell?", "Cell membrane", "Nucleus", "Cytoplasm", "Vacuole", "B", "The nucleus controls cell activities."),
    ("junior", "intermediate_science", None, "Plants", "easy", "Which pigment makes leaves green?", "Carotene", "Chlorophyll", "Haemoglobin", "Melanin", "B", "Chlorophyll is the green pigment in leaves."),
    ("junior", "intermediate_science", None, "Plants", "medium", "The process by which plants make food is called:", "Respiration", "Photosynthesis", "Transpiration", "Digestion", "B", "Photosynthesis is how plants make food."),
    ("junior", "intermediate_science", None, "Plants", "medium", "Which tissue transports water in plants?", "Phloem", "Xylem", "Cambium", "Pith", "B", "Xylem transports water."),
    ("junior", "intermediate_science", None, "Human Body", "easy", "Which organ pumps blood?", "Lungs", "Heart", "Liver", "Kidney", "B", "The heart pumps blood."),
    ("junior", "intermediate_science", None, "Human Body", "easy", "How many bones are in an adult human body?", "186", "206", "226", "246", "B", "An adult human has 206 bones."),
    ("junior", "intermediate_science", None, "Human Body", "medium", "Which blood cells fight infection?", "Red blood cells", "White blood cells", "Platelets", "Plasma", "B", "White blood cells defend against infection."),
    ("junior", "intermediate_science", None, "Human Body", "medium", "The largest organ of the human body is:", "Liver", "Skin", "Brain", "Lungs", "B", "Skin is the largest organ."),
    ("junior", "intermediate_science", None, "Environment", "easy", "Which gas do plants absorb during photosynthesis?", "Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen", "B", "Plants absorb CO2 for photosynthesis."),
    ("junior", "intermediate_science", None, "Environment", "medium", "What do we call the layer of gases surrounding the Earth?", "Lithosphere", "Hydrosphere", "Atmosphere", "Biosphere", "C", "The atmosphere is the layer of gases."),
    ("junior", "intermediate_science", None, "Environment", "medium", "Which of these is a source of water pollution?", "Rain", "Industrial waste", "Sunlight", "Wind", "B", "Industrial waste pollutes water sources."),
    ("junior", "intermediate_science", None, "Space", "easy", "How many planets are in our solar system?", "7", "8", "9", "10", "B", "There are eight planets."),
    ("junior", "intermediate_science", None, "Space", "easy", "What is the closest star to Earth?", "Sirius", "Proxima Centauri", "The Sun", "Polaris", "C", "The Sun is Earth's closest star."),
    ("junior", "intermediate_science", None, "Space", "medium", "The natural satellite of Earth is:", "Mars", "Moon", "Venus", "Sun", "B", "The Moon orbits Earth."),
    ("junior", "intermediate_science", None, "Chemistry Basics", "easy", "What is the chemical symbol for water?", "CO2", "H2O", "O2", "NaCl", "B", "Water is H2O."),
    ("junior", "intermediate_science", None, "Chemistry Basics", "medium", "What is the smallest particle of an element?", "Molecule", "Atom", "Compound", "Mixture", "B", "An atom is the smallest particle of an element."),
    ("junior", "intermediate_science", None, "Chemistry Basics", "medium", "Which of these is a compound?", "Oxygen", "Hydrogen", "Water", "Gold", "C", "Water (H2O) is a compound."),
    ("junior", "intermediate_science", None, "Chemistry Basics", "easy", "What is the pH of a neutral substance?", "0", "7", "10", "14", "B", "A neutral substance has pH 7."),
]

SENIOR_BIO = [
    ("senior", "biology", None, "Cell Biology", "easy", "Which organelle is the powerhouse of the cell?", "Nucleus", "Mitochondrion", "Ribosome", "Golgi body", "B", "Mitochondria produce ATP — cellular energy."),
    ("senior", "biology", None, "Cell Biology", "easy", "The basic unit of life is:", "Atom", "Cell", "Tissue", "Organ", "B", "The cell is the basic unit of life."),
    ("senior", "biology", None, "Cell Biology", "medium", "Which structure controls what enters and leaves the cell?", "Cell wall", "Cell membrane", "Cytoplasm", "Nucleus", "B", "The cell membrane is selectively permeable."),
    ("senior", "biology", None, "Cell Biology", "medium", "Which of these is found in plant cells but not animal cells?", "Nucleus", "Chloroplast", "Mitochondria", "Ribosome", "B", "Chloroplasts are in plant cells, not animal cells."),
    ("senior", "biology", None, "Cell Biology", "medium", "Cell theory states that:", "All cells come from non-living matter", "All living things are made of cells", "Cells cannot divide", "Only plants have cells", "B", "Cell theory: all living things are made of cells."),
    ("senior", "biology", None, "Genetics", "medium", "Who is considered the father of genetics?", "Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Robert Hooke", "B", "Mendel established the laws of inheritance."),
    ("senior", "biology", None, "Genetics", "medium", "A section of DNA that codes for a trait is called a:", "Chromosome", "Gene", "Nucleotide", "Protein", "B", "A gene is a segment of DNA coding for a trait."),
    ("senior", "biology", None, "Genetics", "medium", "In humans, which chromosome pair determines sex?", "Autosome 21", "Chromosome 23 (X/Y)", "Chromosome 1", "Mitochondrial DNA", "B", "Sex is determined by X and Y chromosomes."),
    ("senior", "biology", None, "Genetics", "medium", "A cross between two heterozygous (Tt) pea plants gives what phenotype ratio?", "1:1", "3:1", "2:1", "1:2:1", "B", "Tt x Tt gives 3 dominant : 1 recessive."),
    ("senior", "biology", None, "Genetics", "hard", "Which of these describes a mutation?", "A change in DNA sequence", "A type of cell division", "A protein shape", "A hormone level", "A", "A mutation is a change in the DNA sequence."),
    ("senior", "biology", None, "Photosynthesis", "medium", "Where does photosynthesis take place?", "Mitochondria", "Chloroplast", "Nucleus", "Ribosome", "B", "Chloroplasts are the site of photosynthesis."),
    ("senior", "biology", None, "Photosynthesis", "medium", "Which gas is released during photosynthesis?", "Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen", "B", "Oxygen is released as a by-product."),
    ("senior", "biology", None, "Photosynthesis", "hard", "Which pigment absorbs light for photosynthesis?", "Carotene", "Chlorophyll", "Xanthophyll", "Anthocyanin", "B", "Chlorophyll absorbs light for photosynthesis."),
    ("senior", "biology", None, "Respiration", "medium", "Aerobic respiration requires which gas?", "Nitrogen", "Oxygen", "Helium", "Methane", "B", "Aerobic respiration uses oxygen."),
    ("senior", "biology", None, "Respiration", "medium", "Where does aerobic respiration mainly occur in a cell?", "Nucleus", "Mitochondria", "Ribosome", "Chloroplast", "B", "Aerobic respiration mainly occurs in mitochondria."),
    ("senior", "biology", None, "Respiration", "hard", "Which of these is produced during anaerobic respiration in human muscle?", "Ethanol", "Lactic acid", "Carbon dioxide only", "Methane", "B", "Human muscle produces lactic acid anaerobically."),
    ("senior", "biology", None, "Human Body", "medium", "How many bones are in the adult human body?", "186", "206", "226", "246", "B", "Adults have 206 bones."),
    ("senior", "biology", None, "Human Body", "medium", "Which blood vessel carries oxygenated blood away from the heart?", "Pulmonary artery", "Aorta", "Vena cava", "Pulmonary vein", "B", "The aorta carries oxygenated blood away from the heart."),
    ("senior", "biology", None, "Human Body", "hard", "Which chamber of the heart pumps blood to the entire body?", "Right atrium", "Right ventricle", "Left atrium", "Left ventricle", "D", "The left ventricle pumps blood to the body."),
    ("senior", "biology", None, "Human Body", "medium", "Which organ produces insulin?", "Liver", "Pancreas", "Kidney", "Spleen", "B", "Insulin is produced by the pancreas."),
    ("senior", "biology", None, "Human Body", "medium", "Which part of the brain controls balance?", "Cerebrum", "Cerebellum", "Medulla", "Hypothalamus", "B", "The cerebellum controls balance and coordination."),
    ("senior", "biology", None, "Ecology", "easy", "Organisms that make their own food are called:", "Consumers", "Producers", "Decomposers", "Predators", "B", "Producers synthesise their own food."),
    ("senior", "biology", None, "Ecology", "medium", "A food chain shows:", "Water cycle", "Energy flow", "Cell division", "Protein synthesis", "B", "A food chain shows energy transfer."),
    ("senior", "biology", None, "Ecology", "medium", "What is a habitat?", "The food an organism eats", "The natural home of an organism", "The mating season", "A type of cell", "B", "A habitat is an organism's natural home."),
    ("senior", "biology", None, "Ecology", "medium", "Which of these is a biotic factor?", "Temperature", "Predation", "Rainfall", "Soil pH", "B", "Predation is a biotic (living) factor."),
    ("senior", "biology", None, "Reproduction", "medium", "Where does fertilisation normally occur in humans?", "Uterus", "Ovary", "Fallopian tube", "Vagina", "C", "Fertilisation occurs in the fallopian tube."),
    ("senior", "biology", None, "Reproduction", "medium", "The male gamete is called:", "Ovum", "Sperm", "Zygote", "Embryo", "B", "The sperm is the male gamete."),
    ("senior", "biology", None, "Reproduction", "hard", "What is the process by which a zygote divides into many cells?", "Meiosis", "Mitosis", "Fertilisation", "Ovulation", "B", "Mitosis is the division that increases cell number."),
    ("senior", "biology", None, "Classification", "medium", "Mushrooms belong to which kingdom?", "Plantae", "Animalia", "Fungi", "Protista", "C", "Mushrooms are fungi."),
    ("senior", "biology", None, "Classification", "medium", "The scientific name of an organism has how many parts?", "One", "Two", "Three", "Four", "B", "Binomial nomenclature uses genus + species."),
]

SENIOR_CHEM = [
    ("senior", "chemistry", None, "Atomic Structure", "easy", "What is the atomic number of hydrogen?", "0", "1", "2", "3", "B", "Hydrogen has atomic number 1."),
    ("senior", "chemistry", None, "Atomic Structure", "medium", "Which subatomic particle has a negative charge?", "Proton", "Neutron", "Electron", "Nucleus", "C", "Electrons are negatively charged."),
    ("senior", "chemistry", None, "Atomic Structure", "medium", "What is the electronic configuration of carbon (Z=6)?", "2,4", "2,6", "4,2", "1,5", "A", "Carbon: 2 electrons in shell 1, 4 in shell 2."),
    ("senior", "chemistry", None, "Atomic Structure", "hard", "Which of these elements is a noble gas?", "Hydrogen", "Helium", "Oxygen", "Nitrogen", "B", "Helium is a noble gas."),
    ("senior", "chemistry", None, "Periodic Table", "easy", "Which group contains the alkali metals?", "Group 1", "Group 2", "Group 7", "Group 0", "A", "Group 1 elements are alkali metals."),
    ("senior", "chemistry", None, "Periodic Table", "medium", "Which of these is the most reactive halogen?", "Fluorine", "Chlorine", "Bromine", "Iodine", "A", "Fluorine is the most reactive halogen."),
    ("senior", "chemistry", None, "Periodic Table", "medium", "Which element has the chemical symbol Na?", "Nickel", "Sodium", "Nitrogen", "Neon", "B", "Na = sodium."),
    ("senior", "chemistry", None, "Bonding", "medium", "What type of bond forms between metals and non-metals?", "Covalent", "Ionic", "Metallic", "Hydrogen", "B", "Metal + non-metal typically forms an ionic bond."),
    ("senior", "chemistry", None, "Bonding", "medium", "Which compound has a covalent bond?", "NaCl", "MgO", "H2O", "KBr", "C", "Water (H2O) has covalent bonds."),
    ("senior", "chemistry", None, "Bonding", "hard", "What is the shape of a methane (CH4) molecule?", "Linear", "Trigonal planar", "Tetrahedral", "Bent", "C", "Methane is tetrahedral."),
    ("senior", "chemistry", None, "Chemical Reactions", "easy", "Which of these is a decomposition reaction?", "2H2 + O2 → 2H2O", "CaCO3 → CaO + CO2", "NaOH + HCl → NaCl + H2O", "Fe + S → FeS", "B", "CaCO3 decomposes into CaO and CO2."),
    ("senior", "chemistry", None, "Chemical Reactions", "medium", "What is the pH of an acidic solution?", "7", "Less than 7", "Greater than 7", "0", "B", "Acids have pH less than 7."),
    ("senior", "chemistry", None, "Chemical Reactions", "medium", "Which of these is a redox reaction?", "NaOH + HCl → NaCl + H2O", "2Mg + O2 → 2MgO", "CaO + H2O → Ca(OH)2", "AgNO3 + NaCl → AgCl + NaNO3", "B", "Magnesium is oxidised, oxygen reduced — redox."),
    ("senior", "chemistry", None, "Chemical Reactions", "hard", "Which of these is an exothermic reaction?", "Photosynthesis", "Combustion of methane", "Electrolysis of water", "Melting of ice", "B", "Combustion releases heat — exothermic."),
    ("senior", "chemistry", None, "Acids and Bases", "easy", "What is the chemical formula of hydrochloric acid?", "H2SO4", "HNO3", "HCl", "H2CO3", "C", "HCl is hydrochloric acid."),
    ("senior", "chemistry", None, "Acids and Bases", "medium", "What is formed when an acid reacts with a base?", "Salt only", "Salt and water", "Gas only", "Metal only", "B", "Acid + base → salt + water (neutralisation)."),
    ("senior", "chemistry", None, "Acids and Bases", "medium", "Which indicator turns red in acid?", "Methyl orange", "Litmus", "Phenolphthalein", "Universal indicator", "B", "Litmus turns red in acid."),
    ("senior", "chemistry", None, "Acids and Bases", "hard", "What is the concentration of H+ in a solution of pH 3?", "3 mol/dm3", "0.3 mol/dm3", "0.001 mol/dm3", "0.003 mol/dm3", "C", "pH 3 means [H+] = 10^-3 = 0.001 mol/dm3."),
    ("senior", "chemistry", None, "Moles", "medium", "What is the molar mass of water (H2O)?", "16 g/mol", "18 g/mol", "20 g/mol", "22 g/mol", "B", "H2O = 2(1) + 16 = 18 g/mol."),
    ("senior", "chemistry", None, "Moles", "medium", "How many moles are in 44 g of CO2?", "0.5", "1", "2", "4", "B", "CO2 molar mass = 44 g/mol. 44 g = 1 mol."),
    ("senior", "chemistry", None, "Moles", "hard", "What is the volume of 1 mole of any gas at STP?", "11.2 dm3", "22.4 dm3", "24 dm3", "44.8 dm3", "B", "1 mol of gas occupies 22.4 dm3 at STP."),
    ("senior", "chemistry", None, "Organic Chemistry", "easy", "What is the general formula of alkanes?", "CnH2n", "CnH2n+2", "CnH2n-2", "CnHn", "B", "Alkanes: CnH2n+2."),
    ("senior", "chemistry", None, "Organic Chemistry", "medium", "Which functional group is in ethanol?", "Aldehyde", "Hydroxyl (-OH)", "Carboxyl", "Amine", "B", "Ethanol contains the hydroxyl group."),
    ("senior", "chemistry", None, "Organic Chemistry", "medium", "Which of these is an alkene?", "Methane", "Ethene", "Propane", "Butane", "B", "Ethene (C2H4) has a C=C double bond — it is an alkene."),
    ("senior", "chemistry", None, "Organic Chemistry", "hard", "What is the product of the addition of water to ethene?", "Ethanol", "Ethyne", "Ethane", "Methane", "A", "Ethene + water → ethanol."),
    ("senior", "chemistry", None, "Metals", "medium", "Which of these metals reacts most vigorously with water?", "Copper", "Iron", "Sodium", "Zinc", "C", "Sodium reacts vigorously with water."),
    ("senior", "chemistry", None, "Metals", "medium", "Which method is used to extract aluminium from bauxite?", "Blast furnace", "Electrolysis", "Fractional distillation", "Roasting", "B", "Aluminium is extracted by electrolysis."),
    ("senior", "chemistry", None, "Metals", "hard", "Which of these is an alloy?", "Pure iron", "Steel", "Pure copper", "Pure gold", "B", "Steel is an alloy of iron and carbon."),
    ("senior", "chemistry", None, "Energy", "medium", "What is the enthalpy change when a bond forms?", "Endothermic", "Exothermic", "Neutral", "Depends on the bond", "B", "Bond formation releases energy — exothermic."),
    ("senior", "chemistry", None, "Energy", "hard", "The first law of thermodynamics is a statement of:", "Conservation of mass", "Conservation of energy", "Entropy increase", "Reaction rate", "B", "First law: energy cannot be created or destroyed."),
    ("senior", "chemistry", None, "Rates", "medium", "Which factor does NOT affect the rate of a chemical reaction?", "Temperature", "Concentration", "Colour of container", "Catalyst", "C", "The colour of the container has no effect."),
]

SENIOR_PHYS = [
    ("senior", "physics", None, "Mechanics", "easy", "What is the SI unit of force?", "Joule", "Newton", "Watt", "Pascal", "B", "Force is measured in newtons (N)."),
    ("senior", "physics", None, "Mechanics", "easy", "What is the SI unit of mass?", "Gram", "Kilogram", "Pound", "Newton", "B", "The kilogram is the SI unit of mass."),
    ("senior", "physics", None, "Mechanics", "medium", "Newton's second law is expressed as:", "F = ma", "F = mv", "F = m/a", "F = a/m", "A", "F = ma — force equals mass times acceleration."),
    ("senior", "physics", None, "Mechanics", "medium", "What is the acceleration due to gravity on Earth (approx)?", "5 m/s2", "9.8 m/s2", "15 m/s2", "20 m/s2", "B", "g ≈ 9.8 m/s2."),
    ("senior", "physics", None, "Mechanics", "medium", "Which of Newton's laws explains why we wear seatbelts?", "First law (inertia)", "Second law", "Third law", "Law of gravitation", "A", "The first law — a body continues in motion unless acted on."),
    ("senior", "physics", None, "Mechanics", "hard", "A body moves 100 m in 20 s. What is its average speed?", "2 m/s", "5 m/s", "10 m/s", "20 m/s", "B", "Speed = 100/20 = 5 m/s."),
    ("senior", "physics", None, "Energy", "easy", "What is the SI unit of energy?", "Newton", "Joule", "Watt", "Ampere", "B", "Energy is measured in joules."),
    ("senior", "physics", None, "Energy", "medium", "Which of these is a renewable energy source?", "Coal", "Solar", "Petroleum", "Natural gas", "B", "Solar is renewable."),
    ("senior", "physics", None, "Energy", "medium", "The law of conservation of energy states:", "Energy can be created", "Energy can be destroyed", "Energy cannot be created or destroyed", "Energy is always lost", "C", "Energy is conserved — it changes form but is not created or destroyed."),
    ("senior", "physics", None, "Energy", "hard", "A 2 kg object falls from 5 m. What is its kinetic energy at the bottom? (g=10)", "20 J", "50 J", "100 J", "200 J", "C", "PE = mgh = 2 x 10 x 5 = 100 J, all converted to KE."),
    ("senior", "physics", None, "Waves", "easy", "What is the SI unit of frequency?", "Metre", "Hertz", "Second", "Joule", "B", "Frequency is measured in hertz (Hz)."),
    ("senior", "physics", None, "Waves", "medium", "Which of these is a transverse wave?", "Sound wave", "Light wave", "Pressure wave in air", "Water pressure wave", "B", "Light is a transverse wave."),
    ("senior", "physics", None, "Waves", "medium", "The speed of light in a vacuum is approx:", "3 x 10^6 m/s", "3 x 10^8 m/s", "3 x 10^10 m/s", "3 x 10^5 m/s", "B", "Light travels at ~3 x 10^8 m/s."),
    ("senior", "physics", None, "Waves", "hard", "What is the relationship between speed, frequency and wavelength?", "v = f/λ", "v = fλ", "v = λ/f", "v = f + λ", "B", "Speed = frequency x wavelength."),
    ("senior", "physics", None, "Electricity", "easy", "What is the SI unit of electric current?", "Volt", "Ampere", "Ohm", "Watt", "B", "Current is measured in amperes (A)."),
    ("senior", "physics", None, "Electricity", "medium", "Ohm's law states:", "V = I/R", "V = IR", "V = R/I", "V = I + R", "B", "V = IR — voltage equals current times resistance."),
    ("senior", "physics", None, "Electricity", "medium", "Which of these is a conductor?", "Rubber", "Copper", "Plastic", "Glass", "B", "Copper is a good conductor."),
    ("senior", "physics", None, "Electricity", "hard", "A 12 V battery drives 2 A through a resistor. What is the resistance?", "4 Ω", "6 Ω", "12 Ω", "24 Ω", "B", "R = V/I = 12/2 = 6 Ω."),
    ("senior", "physics", None, "Magnetism", "medium", "Which rule gives the direction of the magnetic field around a current-carrying wire?", "Right-hand grip rule", "Left-hand rule", "Lenz's law", "Ohm's law", "A", "The right-hand grip rule gives the field direction."),
    ("senior", "physics", None, "Magnetism", "medium", "A device that converts mechanical energy to electrical energy is:", "Motor", "Generator", "Transformer", "Battery", "B", "A generator converts mechanical to electrical energy."),
    ("senior", "physics", None, "Magnetism", "hard", "The unit of magnetic flux density is:", "Weber", "Tesla", "Henry", "Farad", "B", "Magnetic flux density is measured in tesla (T)."),
    ("senior", "physics", None, "Heat", "medium", "Which of these is a mode of heat transfer that does not require a medium?", "Conduction", "Convection", "Radiation", "Evaporation", "C", "Radiation does not require a medium."),
    ("senior", "physics", None, "Heat", "medium", "What is the SI unit of temperature?", "Celsius", "Fahrenheit", "Kelvin", "Rankine", "C", "Kelvin (K) is the SI unit of temperature."),
    ("senior", "physics", None, "Heat", "hard", "What is specific heat capacity?", "Heat needed to raise 1 kg by 1 K", "Heat needed to melt 1 kg", "Heat lost per second", "Heat produced by a current", "A", "Specific heat capacity is heat per kg per kelvin."),
    ("senior", "physics", None, "Modern Physics", "medium", "Who proposed the theory of relativity?", "Isaac Newton", "Albert Einstein", "Niels Bohr", "Max Planck", "B", "Einstein proposed special and general relativity."),
    ("senior", "physics", None, "Modern Physics", "medium", "The photoelectric effect provides evidence that light behaves as:", "A wave only", "A particle", "A fluid", "A gas", "B", "The photoelectric effect shows light behaves as particles (photons)."),
    ("senior", "physics", None, "Modern Physics", "hard", "The equation E = mc^2 relates:", "Energy and charge", "Energy and mass", "Energy and momentum", "Mass and charge", "B", "E = mc^2 relates energy and mass."),
    ("senior", "physics", None, "Measurement", "easy", "Which instrument measures electric current?", "Voltmeter", "Ammeter", "Thermometer", "Barometer", "B", "An ammeter measures current."),
    ("senior", "physics", None, "Measurement", "medium", "Which instrument measures atmospheric pressure?", "Hygrometer", "Barometer", "Thermometer", "Anemometer", "B", "A barometer measures atmospheric pressure."),
    ("senior", "physics", None, "Measurement", "hard", "The dimensions of force are:", "MLT^-2", "ML^2T^-2", "MLT^-1", "ML^-1T^-2", "A", "Force = mass x acceleration = M L T^-2."),
]

ALL_QUESTIONS = GENERAL + JUNIOR + SENIOR_BIO + SENIOR_CHEM + SENIOR_PHYS

# Wipe existing questions (idempotent seed)
db.query(models.Question).delete()
db.commit()

for level, subject, target, topic, diff, q, a, b, c, d, correct, expl in ALL_QUESTIONS:
    db.add(models.Question(
        education_level=level,
        subject=subject,
        exam_target=target,
        topic=topic,
        difficulty=diff,
        question_text=q,
        option_a=a, option_b=b, option_c=c, option_d=d,
        correct_option=correct,
        explanation=expl,
        is_active=True,
    ))
db.commit()

print(f"Seeded {len(ALL_QUESTIONS)} questions")
for level in ("primary", "junior", "senior"):
    for subj in ("general_science", "intermediate_science", "biology", "chemistry", "physics"):
        n = db.query(models.Question).filter(
            models.Question.education_level == level,
            models.Question.subject == subj,
        ).count()
        if n:
            print(f"  {level} / {subj}: {n}")

db.close()