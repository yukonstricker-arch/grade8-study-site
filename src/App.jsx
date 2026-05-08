import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Unlock, Settings, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Upload, Trash2, Edit3, Plus, X, Check, ChevronRight, ChevronLeft, Trophy, Flame, Target, BookOpen, Calculator, Globe, Languages, Cloud, Moon, Zap, Award, Clock, TrendingUp, Eye, EyeOff, RotateCcw, Save, Home, User, LogOut, Search, FileText, PlayCircle, Music, Wind, Headphones } from 'lucide-react';

// ============================================================
// STORAGE HELPERS
// ============================================================
const storage = {
  async get(key, shared = false) {
    try {
      const result = await window.storage.get(key, shared);
      return result ? JSON.parse(result.value) : null;
    } catch (e) {
      return null;
    }
  },
  async set(key, value, shared = false) {
    try {
      await window.storage.set(key, JSON.stringify(value), shared);
      return true;
    } catch (e) {
      console.error('Storage set failed:', e);
      return false;
    }
  },
  async list(prefix, shared = false) {
    try {
      const result = await window.storage.list(prefix, shared);
      return result?.keys || [];
    } catch (e) {
      return [];
    }
  },
  async delete(key, shared = false) {
    try {
      await window.storage.delete(key, shared);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// ============================================================
// EXAM DATES
// ============================================================
const DEFAULT_EXAM_DATES = {
  science: '2026-06-04T08:40:00',
  math: '2026-06-03T08:40:00',
  humanities: '2026-06-02T08:40:00',
  french: '2026-06-01T08:40:00'
};

// ============================================================
// MOTIVATIONAL QUOTES
// ============================================================
const NORMAL_QUOTES = [
  "Calm minds win exams.",
  "Small steps, every day.",
  "You're closer than you think.",
  "Consistency beats intensity.",
  "Trust the process.",
  "One topic at a time.",
  "Quiet effort, loud results.",
  "Show up. That's half the battle.",
];


// ============================================================
// SCIENCE CONTENT (FROM REVIEW PACKAGE)
// ============================================================
const SCIENCE_TOPICS = [
  // Cells Unit
  { id: 'sci-1', unit: 'Cells', title: 'Characteristics of all living things' },
  { id: 'sci-2', unit: 'Cells', title: 'Three main ideas of cell theory' },
  { id: 'sci-3', unit: 'Cells', title: 'Microscope parts and use' },
  { id: 'sci-4', unit: 'Cells', title: 'Cell membrane: structure & function' },
  { id: 'sci-5', unit: 'Cells', title: 'Cell wall: structure & function' },
  { id: 'sci-6', unit: 'Cells', title: 'Chloroplast: structure & function' },
  { id: 'sci-7', unit: 'Cells', title: 'Cytoplasm: structure & function' },
  { id: 'sci-8', unit: 'Cells', title: 'Endoplasmic reticulum: structure & function' },
  { id: 'sci-9', unit: 'Cells', title: 'Golgi apparatus: structure & function' },
  { id: 'sci-10', unit: 'Cells', title: 'Mitochondria: structure & function' },
  { id: 'sci-11', unit: 'Cells', title: 'Nucleus: structure & function' },
  { id: 'sci-12', unit: 'Cells', title: 'Vacuole: structure & function' },
  { id: 'sci-13', unit: 'Cells', title: 'Lysosomes: structure & function' },
  { id: 'sci-14', unit: 'Cells', title: 'Ribosomes: structure & function' },
  { id: 'sci-15', unit: 'Cells', title: 'Identifying organelles in plant & animal cell diagrams' },
  { id: 'sci-16', unit: 'Cells', title: 'Osmosis vs Diffusion' },
  { id: 'sci-17', unit: 'Cells', title: 'Permeable vs Semi-permeable membranes' },
  { id: 'sci-18', unit: 'Cells', title: 'Facilitated diffusion' },
  { id: 'sci-19', unit: 'Cells', title: 'Active vs Passive transport' },
  // Chemistry Unit
  { id: 'sci-20', unit: 'Chemistry', title: 'Matter chart: organization of matter' },
  { id: 'sci-21', unit: 'Chemistry', title: 'Pure substance vs Mixture' },
  { id: 'sci-22', unit: 'Chemistry', title: 'Element, compound, homogeneous, heterogeneous' },
  { id: 'sci-23', unit: 'Chemistry', title: 'Physical vs Chemical properties' },
  { id: 'sci-24', unit: 'Chemistry', title: 'Physical vs Chemical changes' },
  { id: 'sci-25', unit: 'Chemistry', title: 'Three clues of a chemical change' },
  { id: 'sci-26', unit: 'Chemistry', title: 'Organization of the periodic table' },
  { id: 'sci-27', unit: 'Chemistry', title: 'Metals, semimetals (metalloids), non-metals' },
  { id: 'sci-28', unit: 'Chemistry', title: 'Alkali metals (Group 1)' },
  { id: 'sci-29', unit: 'Chemistry', title: 'Alkaline earth metals (Group 2)' },
  { id: 'sci-30', unit: 'Chemistry', title: 'Transition metals' },
  { id: 'sci-31', unit: 'Chemistry', title: 'Halogens (Group 17)' },
  { id: 'sci-32', unit: 'Chemistry', title: 'Noble gases (Group 18)' },
  { id: 'sci-33', unit: 'Chemistry', title: 'Calculating protons, electrons, neutrons' },
  { id: 'sci-34', unit: 'Chemistry', title: 'Valence electrons & group number relationship' },
  { id: 'sci-35', unit: 'Chemistry', title: 'Shells & periods relationship' },
  { id: 'sci-36', unit: 'Chemistry', title: 'Bohr-Rutherford diagrams' },
  { id: 'sci-37', unit: 'Chemistry', title: 'Lewis dot diagrams' },
  { id: 'sci-38', unit: 'Chemistry', title: 'Ions, cations, anions, stable octet' },
  { id: 'sci-39', unit: 'Chemistry', title: 'Formation of ionic compounds' },
  { id: 'sci-40', unit: 'Chemistry', title: 'Properties of ionic compounds' },
  { id: 'sci-41', unit: 'Chemistry', title: 'Formation of molecular (covalent) compounds' },
  { id: 'sci-42', unit: 'Chemistry', title: 'Naming simple ionic compounds' },
  // Biology - Multicellular
  { id: 'sci-43', unit: 'Biology', title: 'Unicellular vs Multicellular organisms' },
  { id: 'sci-44', unit: 'Biology', title: 'How unicellular organisms move, eat, breathe, obtain water' },
  { id: 'sci-45', unit: 'Biology', title: 'Levels of organization (cellâ†’tissueâ†’organâ†’systemâ†’organism)' },
  { id: 'sci-46', unit: 'Biology', title: 'Stem cells: totipotent vs pluripotent' },
  { id: 'sci-47', unit: 'Biology', title: 'Cell specialization & differentiation' },
  { id: 'sci-48', unit: 'Biology', title: 'Abnormal cell development & mutations' },
  { id: 'sci-49', unit: 'Biology', title: 'Four types of tissue (muscle, nervous, connective, epithelial)' },
  { id: 'sci-50', unit: 'Biology', title: 'Lab skills: claim/evidence/reasoning' },
];

const SCIENCE_QUIZ = [
  { q: "The inside of the cell contains a jelly-like substance known as the...", choices: ["Golgi apparatus", "Cytoplasm", "Lysosome", "Endoplasmic reticulum"], answer: 1 },
  { q: "Which organelle is responsible for the primary packaging of chemicals?", choices: ["Golgi apparatus", "Mitochondria", "Vacuole", "Cell wall"], answer: 0 },
  { q: "Which statement about organelles is INCORRECT?", choices: ["They work together to create the cell", "They are small but can be seen using a microscope", "They can be found in unicellular and multicellular organisms", "They differ in plant vs animal cells"], answer: 1 },
  { q: "This organelle functions in cellular respiration:", choices: ["Lysosome", "Endoplasmic reticulum", "Mitochondrion", "Golgi apparatus"], answer: 2 },
  { q: "Helps transport proteins:", choices: ["Endoplasmic reticulum", "Lysosome", "Vacuole", "Cell wall"], answer: 0 },
  { q: "Large fluid-filled space in plant cells used for storage and shape:", choices: ["Ribosome", "Vacuole", "Cell wall", "Chloroplast"], answer: 1 },
  { q: "Responsible for destroying worn-out cell parts:", choices: ["Lysosomes", "Mitochondrion", "Golgi apparatus", "Ribosomes"], answer: 0 },
  { q: "Process where water passes through a semipermeable barrier from high to low concentration:", choices: ["Osmosis", "Diffusion", "Life", "Both a and b"], answer: 0 },
  { q: "Which is NOT an example of diffusion?", choices: ["Red blood cells swelling in fresh water", "Adding food colouring to water", "Adding salt to make a salt crystal", "Perfume filling a room"], answer: 0 },
  { q: "What do you use to focus under high power on a microscope?", choices: ["Coarse adjustment knob", "Revolving nosepiece", "Diaphragm", "Fine adjustment knob"], answer: 3 },
  { q: "Which is an example of a chemical property?", choices: ["State of matter", "Brittleness", "Flammability", "Odour"], answer: 2 },
  { q: "Which is an example of a qualitative property?", choices: ["Mass", "State of matter", "Volume", "Temperature"], answer: 1 },
  { q: "What change(s) take place when a candle is burned?", choices: ["Chemical change only", "Chemical and physical changes", "Physical change only", "None"], answer: 1 },
  { q: "Which is an example of a chemical change?", choices: ["Crumpling paper", "Melting ice", "Baking a cake", "Deflating a basketball"], answer: 2 },
  { q: "Which is a chemical property?", choices: ["Lustre", "Solubility in water", "Brittleness", "Reaction with an acid"], answer: 3 },
  { q: "Which is a chemical property of gold?", choices: ["Soft", "Reflects light", "Does not rust easily", "Can be scratched by a penny"], answer: 2 },
  { q: "Kevin says boiling water is a chemical change. He is...", choices: ["Correct, bubbles are evidence", "Incorrect, boiling is physical", "Correct but physical also occurred", "Incorrect, no change occurred"], answer: 1 },
  { q: "Which particle has no electrical charge?", choices: ["Proton", "Neutron", "Electron", "Orbit"], answer: 1 },
  { q: "Which particles are found in the nucleus?", choices: ["Protons and electrons", "Protons and neutrons", "Electrons and neutrons", "Electrons and orbits"], answer: 1 },
  { q: "About protons and electrons in an atom:", choices: ["More protons than electrons", "More electrons than protons", "Number of protons = electrons", "Varies by atom"], answer: 2 },
  { q: "How many electrons can the first orbit hold?", choices: ["2", "4", "6", "8"], answer: 0 },
  { q: "What is the name for the number of protons in an atom?", choices: ["Atomic number", "Period", "Group", "Chemical family"], answer: 0 },
  { q: "An object that is dull, brittle, and a poor conductor is most likely a:", choices: ["Metal", "Non-metal", "Metalloid", "Alloy"], answer: 1 },
  { q: "An object that is shiny, malleable, and a good conductor is most likely a:", choices: ["Metal", "Non-metal", "Metalloid", "Alloy"], answer: 0 },
  { q: "Which is an example of a metal?", choices: ["Calcium", "Carbon", "Sulfur", "Iodine"], answer: 0 },
  { q: "Which statement is true?", choices: ["Fluorine is more reactive than oxygen", "Sulfur more reactive than chlorine", "Beryllium more reactive than lithium", "Magnesium more reactive than sodium"], answer: 0 },
  { q: "Which element is in the same period as neon?", choices: ["Oxygen", "Chlorine", "Argon", "Helium"], answer: 0 },
  { q: "Which element is in the same chemical family as sulfur?", choices: ["Oxygen", "Chlorine", "Phosphorus", "Helium"], answer: 0 },
  { q: "Which group do most elements in living things belong to?", choices: ["Alkali metals", "Alkaline earth metals", "Non-metals", "Metalloids"], answer: 2 },
  { q: "Which atomic model shows oxygen?", choices: ["6p+ 6n0", "8p+ 8n0", "7p+ 7n0", "9p+ 10n0"], answer: 1 },
];

const SCIENCE_FLASHCARDS = [
  { front: "Cell Theory â€” 3 key ideas", back: "1) All living things are made of cells. 2) Cells are the basic unit of life. 3) All cells come from pre-existing cells." },
  { front: "Mitochondria", back: "Powerhouse of the cell â€” performs cellular respiration to produce energy (ATP). Found in BOTH plant and animal cells." },
  { front: "Chloroplast", back: "Found ONLY in plant cells. Contains chlorophyll. Performs photosynthesis to convert sunlight into sugar." },
  { front: "Cell wall", back: "Found ONLY in plant cells. Made of cellulose. Provides rigid structural support and protection." },
  { front: "Cell membrane", back: "Semi-permeable barrier around all cells. Controls what enters and exits the cell." },
  { front: "Nucleus", back: "Control center of the cell. Holds DNA. Tells the cell what to do." },
  { front: "Cytoplasm", back: "Jelly-like fluid inside the cell where organelles float." },
  { front: "Endoplasmic Reticulum (ER)", back: "Network of membranes that transports proteins and other materials through the cell." },
  { front: "Golgi apparatus", back: "Packages and ships chemicals/proteins throughout the cell. Like the cell's post office." },
  { front: "Vacuole", back: "Storage sac. Large in plant cells (helps maintain shape), small in animal cells." },
  { front: "Lysosome", back: "Contains digestive enzymes. Breaks down worn-out cell parts and invading viruses/bacteria." },
  { front: "Ribosome", back: "Site of protein synthesis. Makes proteins for the cell." },
  { front: "Osmosis", back: "Movement of WATER from high water concentration to low water concentration through a semi-permeable membrane." },
  { front: "Diffusion", back: "Movement of any particle (gas, dissolved substance) from high concentration to low concentration." },
  { front: "Active transport", back: "Movement of substances AGAINST the concentration gradient â€” requires energy." },
  { front: "Passive transport", back: "Movement of substances WITH the concentration gradient â€” no energy needed (e.g. diffusion, osmosis)." },
  { front: "Pure substance vs Mixture", back: "Pure: only one type of particle (element or compound). Mixture: two or more substances physically combined." },
  { front: "Element vs Compound", back: "Element: one type of atom (e.g. Cu). Compound: two or more elements chemically bonded (e.g. Hâ‚‚O)." },
  { front: "Homogeneous mixture", back: "A uniform mixture (a solution). You cannot see the different components. Example: salt water, air." },
  { front: "Heterogeneous mixture", back: "A non-uniform mixture. You CAN see the different components. Example: trail mix, sand in water." },
  { front: "Physical change", back: "No new substance formed. Usually a change in state. Reversible. Example: melting ice, ripping paper." },
  { front: "Chemical change", back: "New substance formed. Cannot be easily reversed. Example: burning paper, rusting iron, digestion." },
  { front: "3 clues of a chemical change", back: "1) A gas is formed. 2) A precipitate (solid) is formed. 3) Heat, light, or electricity is produced." },
  { front: "Alkali metals (Group 1)", back: "Shiny, conductive, VERY reactive. Lose 1 electron to form +1 cations. Example: Na, K, Li." },
  { front: "Alkaline earth metals (Group 2)", back: "Less reactive than alkali metals. Lose 2 electrons to form +2 cations. Example: Ca, Mg." },
  { front: "Halogens (Group 17)", back: "Very reactive non-metals. Gain 1 electron to form -1 anions. Example: F, Cl, Br." },
  { front: "Noble gases (Group 18)", back: "Stable, unreactive. Already have a full valence shell (8 electrons, except He which has 2)." },
  { front: "Atomic number", back: "Number of PROTONS in an atom. Identifies the element. Equals number of electrons in a neutral atom." },
  { front: "Mass number", back: "Total number of protons + neutrons. Found by rounding atomic mass to nearest whole number." },
  { front: "Valence electrons", back: "Electrons in the outermost shell. Determine bonding behavior. Group number = valence electrons (groups 1, 2, 13â€“18)." },
  { front: "Stable octet", back: "Having 8 electrons in the valence shell (or 2 for very small atoms). The goal of bonding." },
  { front: "Ionic bond", back: "Bond between a METAL and a NON-METAL. Electrons are TRANSFERRED. Forms ionic crystals." },
  { front: "Covalent (molecular) bond", back: "Bond between two NON-METALS. Electrons are SHARED. Forms molecules." },
  { front: "Cation", back: "Positively charged ion. Formed when an atom LOSES electrons. Metals form cations." },
  { front: "Anion", back: "Negatively charged ion. Formed when an atom GAINS electrons. Non-metals form anions." },
  { front: "Totipotent stem cell", back: "Can become ANY type of cell. Can form an entire organism. (Total potential)" },
  { front: "Pluripotent stem cell", back: "Can become MOST types of cells, but cannot form an entire organism." },
  { front: "Levels of organization", back: "Cell â†’ Tissue â†’ Organ â†’ Organ System â†’ Organism. Each level builds on the previous." },
  { front: "Muscle tissue", back: "3 types: smooth, skeletal, cardiac. Responsible for movement." },
  { front: "Nervous tissue", back: "Made of neurons. Sends and receives messages throughout the body." },
  { front: "Connective tissue", back: "Connects/supports other tissues. Examples: bone, blood, fat, cartilage." },
  { front: "Epithelial tissue", back: "Covers body surfaces and lines body cavities (skin, organ linings)." },
];

// ============================================================
// MATH CONTENT (FROM REVIEW PACKAGE)
// ============================================================
const MATH_TOPICS = [
  // Linear Relations
  { id: 'math-1', unit: 'Linear Relations', title: 'Representing relations: tables, graphs, equations' },
  { id: 'math-2', unit: 'Linear Relations', title: 'Matching relations between forms' },
  { id: 'math-3', unit: 'Linear Relations', title: 'Independent vs dependent variables' },
  { id: 'math-4', unit: 'Linear Relations', title: 'Discrete vs continuous data' },
  { id: 'math-5', unit: 'Linear Relations', title: 'Direct vs partial variation' },
  { id: 'math-6', unit: 'Linear Relations', title: 'Solving word problems involving relations' },
  { id: 'math-7', unit: 'Linear Relations', title: 'Calculating slope / rate of change' },
  { id: 'math-8', unit: 'Linear Relations', title: 'Determining x-intercept and y-intercept' },
  { id: 'math-9', unit: 'Linear Relations', title: 'Slope-intercept form (y = mx + b)' },
  { id: 'math-10', unit: 'Linear Relations', title: 'Graphing from tables and intercepts' },
  { id: 'math-11', unit: 'Linear Relations', title: 'Meaning of slope and intercepts in context' },
  { id: 'math-12', unit: 'Linear Relations', title: 'Determining if points lie on a line' },
  { id: 'math-13', unit: 'Linear Relations', title: 'Identifying linear vs nonlinear relations' },
  // 2D Figures
  { id: 'math-14', unit: '2D Figures', title: 'Properties of triangles' },
  { id: 'math-15', unit: '2D Figures', title: 'Properties of quadrilaterals' },
  { id: 'math-16', unit: '2D Figures', title: 'Solving for unknown angles' },
  { id: 'math-17', unit: '2D Figures', title: 'Sum of interior angles' },
  { id: 'math-18', unit: '2D Figures', title: 'Sum of exterior angles' },
  { id: 'math-19', unit: '2D Figures', title: 'Single interior/exterior angle measure' },
  { id: 'math-20', unit: '2D Figures', title: 'Conjectures about diagonals' },
  { id: 'math-21', unit: '2D Figures', title: 'Conjectures about midsegments' },
  { id: 'math-22', unit: '2D Figures', title: 'Conjectures about medians' },
  { id: 'math-23', unit: '2D Figures', title: 'Centroids using medians and bimedians' },
  { id: 'math-24', unit: '2D Figures', title: 'Counterexamples' },
  // Measurement
  { id: 'math-25', unit: 'Measurement', title: 'Optimum area and perimeter' },
  { id: 'math-26', unit: 'Measurement', title: 'Composite shapes' },
  { id: 'math-27', unit: 'Measurement', title: 'Pythagorean Theorem' },
  { id: 'math-28', unit: 'Measurement', title: 'Surface area of right pyramids' },
  { id: 'math-29', unit: 'Measurement', title: 'Surface area of cones' },
  { id: 'math-30', unit: 'Measurement', title: 'Volume of pyramids' },
  { id: 'math-31', unit: 'Measurement', title: 'Volume of cones' },
  { id: 'math-32', unit: 'Measurement', title: 'Volume of a sphere' },
  { id: 'math-33', unit: 'Measurement', title: 'Surface area of a sphere' },
];

const MATH_QUIZ = [
  { q: "What is the sum of the exterior angles in a regular 13-gon?", choices: ["152.3Â°", "360Â°", "1980Â°", "3960Â°"], answer: 1 },
  { q: "How many counterexamples do you need to disprove a conjecture?", choices: ["0", "1", "2", "3"], answer: 1 },
  { q: "The midsegments of a quadrilateral always form a:", choices: ["Rectangle", "Square", "Rhombus", "Parallelogram"], answer: 3 },
  { q: "What quadrilateral is formed by the midsegments of a rhombus?", choices: ["Square", "Rectangle", "Rhombus", "Parallelogram"], answer: 1 },
  { q: "Where is the centroid of a scalene triangle located?", choices: ["Intersection of medians", "Intersection of diagonals", "Intersection of midsegments", "Intersection of bimedians"], answer: 0 },
  { q: "What is the maximum area of a rectangle with perimeter 80 km?", choices: ["200 kmÂ²", "225 kmÂ²", "400 kmÂ²", "360 kmÂ²"], answer: 2 },
  { q: "What is the minimum perimeter of a rectangle with area 225 mmÂ²?", choices: ["100 mm", "25 mm", "56.25 mm", "60 mm"], answer: 3 },
  { q: "What is the surface area of a sphere with diameter 24 cm? (Ï€ â‰ˆ 3.14)", choices: ["602.88 cmÂ²", "904.32 cmÂ²", "1808.64 cmÂ²", "7234.56 cmÂ²"], answer: 2 },
  { q: "What is the surface area of a beach ball with radius 20 cm?", choices: ["502.4 cmÂ²", "1256 cmÂ²", "5024 cmÂ²", "20096 cmÂ²"], answer: 2 },
  { q: "Slope between (-9, 7) and (2, -6)?", choices: ["-13/11", "-11/13", "11/13", "13/11"], answer: 0 },
  { q: "Which equation represents a nonlinear relation?", choices: ["y = -3x/4 + 6/7", "7x - 9y + 2 = 0", "y = (2/3)xÂ² + 11", "-5y/6 = 8x/9 - 1"], answer: 2 },
  { q: "Determine the slope from x=10,y=1 to x=12,y=0 to x=14,y=-1 (table):", choices: ["-2", "-1/2", "1/2", "2"], answer: 1 },
  { q: "Surface area of a square pyramid with height 15 cm and base 16 cm?", choices: ["576 cmÂ²", "800 cmÂ²", "960 cmÂ²", "1344 cmÂ²"], answer: 0 },
  { q: "Volume of a sphere with radius 9.6 cm?", choices: ["180.64 cmÂ³", "463.01 cmÂ³", "2083.55 cmÂ³", "3704.09 cmÂ³"], answer: 3 },
  { q: "Volume of a cone with height 25 mm, base diameter 30 mm?", choices: ["785 mmÂ³", "5888 mmÂ³", "6830 mmÂ³", "23550 mmÂ³"], answer: 1 },
  { q: "Volume of a square pyramid with base side 24 cm and slant height 15 cm? (Use h=9)", choices: ["432 cmÂ³", "720 cmÂ³", "1728 cmÂ³", "2880 cmÂ³"], answer: 2 },
  { q: "Missing leg in a right triangle, hypotenuse 47 cm, other leg 9 cm?", choices: ["20.6 cm", "28.0 cm", "46.1 cm", "47.9 cm"], answer: 2 },
  { q: "Hypotenuse with legs 19 m and 52 m?", choices: ["55 m", "57 m", "63 m", "71 m"], answer: 0 },
  { q: "Maximum area rectangle with perimeter 50 cm?", choices: ["12.5Ã—12.5", "10Ã—15", "5Ã—20", "11Ã—14"], answer: 0 },
  { q: "If interior:exterior angle ratio is 29:1, how many sides?", choices: ["30", "60", "29", "120"], answer: 1 },
];

const MATH_FORMULAS = [
  { name: "Slope (rate of change)", formula: "m = (yâ‚‚ âˆ’ yâ‚) / (xâ‚‚ âˆ’ xâ‚)", note: "Rise over run between two points" },
  { name: "Slope-intercept form", formula: "y = mx + b", note: "m = slope, b = y-intercept" },
  { name: "Pythagorean Theorem", formula: "aÂ² + bÂ² = cÂ²", note: "c is the hypotenuse (longest side, opposite right angle)" },
  { name: "Sum of interior angles", formula: "(n âˆ’ 2) Ã— 180Â°", note: "n = number of sides" },
  { name: "Sum of exterior angles", formula: "360Â°", note: "Always 360Â° for any polygon" },
  { name: "Single interior angle (regular polygon)", formula: "[(n âˆ’ 2) Ã— 180Â°] / n", note: "" },
  { name: "Single exterior angle (regular polygon)", formula: "360Â° / n", note: "" },
  { name: "Area of rectangle", formula: "A = l Ã— w", note: "" },
  { name: "Perimeter of rectangle", formula: "P = 2(l + w)", note: "" },
  { name: "Area of triangle", formula: "A = (1/2) Ã— b Ã— h", note: "" },
  { name: "Area of circle", formula: "A = Ï€rÂ²", note: "" },
  { name: "Circumference of circle", formula: "C = 2Ï€r = Ï€d", note: "" },
  { name: "Surface area of square pyramid", formula: "SA = bÂ² + 2bs", note: "b = base side, s = slant height" },
  { name: "Volume of square pyramid", formula: "V = (1/3) Ã— bÂ² Ã— h", note: "b = base side, h = height" },
  { name: "Surface area of cone", formula: "SA = Ï€rÂ² + Ï€rs", note: "r = radius, s = slant height" },
  { name: "Volume of cone", formula: "V = (1/3) Ã— Ï€rÂ²h", note: "" },
  { name: "Surface area of sphere", formula: "SA = 4Ï€rÂ²", note: "" },
  { name: "Volume of sphere", formula: "V = (4/3) Ã— Ï€rÂ³", note: "" },
  { name: "Slant height (cone/pyramid)", formula: "sÂ² = rÂ² + hÂ²  (or  sÂ² = (b/2)Â² + hÂ²)", note: "Use Pythagorean theorem" },
  { name: "Optimum area (rectangle, fixed perimeter)", formula: "Square: l = w = P/4", note: "Maximum area = a square" },
  { name: "Optimum perimeter (rectangle, fixed area)", formula: "Square: l = w = âˆšA", note: "Minimum perimeter = a square" },
];

const MATH_FLASHCARDS = [
  { front: "What is slope?", back: "Slope = rise / run = (yâ‚‚ - yâ‚) / (xâ‚‚ - xâ‚). It measures how steep a line is." },
  { front: "Slope-intercept form", back: "y = mx + b, where m is the slope and b is the y-intercept." },
  { front: "What is the y-intercept?", back: "The point where the line crosses the y-axis. x = 0 there. In y=mx+b, it's b." },
  { front: "What is the x-intercept?", back: "The point where the line crosses the x-axis. y = 0 there. Solve mx + b = 0." },
  { front: "Direct variation", back: "y = mx (no constant). Line passes through (0, 0). Constant ratio between x and y." },
  { front: "Partial variation", back: "y = mx + b (b â‰  0). Line does NOT pass through origin. Has a starting/fixed value." },
  { front: "Discrete vs continuous", back: "Discrete: separate values, like number of people (cannot be 2.5). Continuous: any value, like weight or time." },
  { front: "Independent variable", back: "The input. The variable you control. Goes on the x-axis." },
  { front: "Dependent variable", back: "The output. Depends on the input. Goes on the y-axis." },
  { front: "Linear vs nonlinear", back: "Linear: equation has only xÂ¹ (no xÂ², âˆšx, etc.) AND first differences in table are constant. Nonlinear otherwise." },
  { front: "Sum of interior angles", back: "(n âˆ’ 2) Ã— 180Â°  where n = number of sides." },
  { front: "Sum of exterior angles", back: "Always 360Â°, no matter how many sides." },
  { front: "Pythagorean Theorem", back: "aÂ² + bÂ² = cÂ². Only works for RIGHT triangles. c is the hypotenuse." },
  { front: "How to find hypotenuse", back: "c = âˆš(aÂ² + bÂ²)" },
  { front: "How to find a leg", back: "a = âˆš(cÂ² âˆ’ bÂ²)" },
  { front: "Volume of pyramid", back: "V = (1/3) Ã— base area Ã— height. The (1/3) is key â€” it's 1/3 of a prism." },
  { front: "Volume of cone", back: "V = (1/3) Ã— Ï€ Ã— rÂ² Ã— h. Same idea: 1/3 of a cylinder." },
  { front: "Volume of sphere", back: "V = (4/3) Ã— Ï€ Ã— rÂ³" },
  { front: "Surface area of sphere", back: "SA = 4 Ã— Ï€ Ã— rÂ²" },
  { front: "Counterexample", back: "An example that disproves a conjecture. ONE counterexample is enough to prove a conjecture false." },
  { front: "Centroid", back: "The center of gravity of a shape. For a triangle: intersection of the 3 medians. For a quadrilateral: intersection of bimedians." },
  { front: "Midsegment", back: "A segment connecting the midpoints of two sides of a polygon." },
  { front: "Median (of a triangle)", back: "A segment from a vertex to the midpoint of the opposite side." },
  { front: "Maximum area for fixed perimeter", back: "A SQUARE gives the maximum area. l = w = P/4." },
  { front: "Minimum perimeter for fixed area", back: "A SQUARE gives the minimum perimeter. l = w = âˆšA." },
];


// ============================================================
// EXPANDED STUDY CONTENT
// ============================================================
const toTopic = (prefix, rows) => rows.split(';').map((row, i) => { const [unit, title] = row.split('|'); return { id: `${prefix}-${i + 1}`, unit, title }; });
const toCards = rows => rows.split(';').map(row => { const [front, back] = row.split('|'); return { front, back }; });
const cardQuiz = (cards, label = 'term') => cards.map((card, i) => ({ q: `Which definition matches ${label} "${card.front}"?`, choices: [card.back, cards[(i + 7) % cards.length].back, cards[(i + 17) % cards.length].back, cards[(i + 29) % cards.length].back], answer: 0 }));
const wordList = rows => rows.split(';').map(row => { const [word, definition] = row.split('|'); return { word, definition }; });

const SCIENCE_EXTRA_TOPICS = toTopic('sci-extra', 'Cells|Plant vs animal cells;Cells|Microscope magnification;Cells|Wet mount slides;Cells|Surface area and volume;Cells|Concentration gradients;Cells|Hypertonic hypotonic isotonic;Cells|Photosynthesis vs respiration;Cells|Protein pathway ER Golgi;Chemistry|Classifying matter;Chemistry|Separating mixtures;Chemistry|Physical properties;Chemistry|Chemical reaction evidence;Chemistry|Atomic mass vs atomic number;Chemistry|Bohr diagrams first 20;Chemistry|Lewis dot diagrams;Chemistry|Ion charges;Chemistry|Writing ionic formulas;Chemistry|Naming ionic compounds;Chemistry|Covalent compounds;Chemistry|Metals non-metals metalloids;Biology|Specialized cells;Biology|Stem cells;Biology|Cancer and cell division;Biology|Tissue organ system examples;Lab Skills|Variables and fair tests;Lab Skills|Reading graphs;Lab Skills|Claim evidence reasoning;Lab Skills|WHMIS and safety;Review|Common exam traps;Review|Mixed cumulative science');
const SCIENCE_EXTRA_FLASHCARDS = toCards('Plant vs animal cells|Plant cells have a cell wall chloroplasts and a large vacuole; animal cells do not.;Microscope magnification|Total magnification equals eyepiece times objective.;Wet mount|A slide with liquid and a cover slip lowered at an angle.;Hypertonic|More solute outside the cell so water leaves and the cell shrinks.;Hypotonic|Less solute outside the cell so water enters and the cell swells.;Isotonic|Equal solute concentration so water movement is balanced.;Concentration gradient|A difference in concentration between two areas.;Facilitated diffusion|Passive movement through membrane proteins.;Photosynthesis|Carbon dioxide and water plus sunlight make glucose and oxygen.;Cellular respiration|Glucose and oxygen release usable energy.;Protein pathway|Ribosome makes protein ER transports Golgi packages.;Surface area to volume|Large cells exchange materials less efficiently.;Solution|A uniform homogeneous mixture.;Mechanical mixture|A heterogeneous mixture with visible parts.;Suspension|A mixture whose particles can settle.;Physical property|Observed without making a new substance.;Chemical property|Describes how a substance reacts.;Precipitate|A solid formed from a chemical reaction in solution.;Atomic mass|Average mass used to estimate mass number.;Neutrons|Rounded atomic mass minus atomic number.;Period|A row showing occupied shells for early elements.;Group|A column that predicts valence electrons.;Metalloid|An element with metal and non-metal properties.;Ionic formula|Charges balance to make a neutral compound.;Ionic naming|Metal name then non-metal ending in ide.;Covalent compound|Non-metals sharing electrons.;Metal properties|Shiny malleable ductile good conductors.;Non-metal properties|Dull brittle poor conductors.;Differentiation|Unspecialized cells become specialized.;Mutation|A DNA change that can affect cells.;Cancer|Uncontrolled cell division.;Tissue|Similar cells working together.;Organ|Different tissues working together.;Organ system|Organs working together.;Independent variable|The factor you change.;Dependent variable|The factor you measure.;Controlled variables|Factors kept the same.;CER|Claim evidence reasoning.;Qualitative|Descriptive observation without numbers.;Quantitative|Observation with numbers and units.;WHMIS|Hazard symbols and safe lab habits.');
const SCIENCE_EXTRA_QUIZ = [...cardQuiz(SCIENCE_EXTRA_FLASHCARDS, 'science term'), { q: 'A 10x eyepiece and 40x objective gives...', choices: ['40x','50x','400x','4000x'], answer: 2 }, { q: 'Sodium has atomic number 11 and mass number 23. Neutrons?', choices: ['11','12','23','34'], answer: 1 }, { q: 'Calcium chloride formula?', choices: ['CaCl','CaCl2','Ca2Cl','Ca2Cl2'], answer: 1 }];

const MATH_EXTRA_TOPICS = toTopic('math-extra', 'Linear Relations|Slope rate of change;Linear Relations|Y-intercept initial value;Linear Relations|Tables graphs equations;Linear Relations|Direct partial variation;Algebra|One-step equations;Algebra|Two-step equations;Algebra|Distributive property;Algebra|Like terms;Algebra|Substitution;Number Sense|Integer operations;Number Sense|Fractions;Number Sense|Percent increase decrease;Number Sense|Ratios rates proportions;Geometry|Angle relationships;Geometry|Pythagorean theorem;Geometry|Area formulas;Geometry|Surface area;Geometry|Volume;Data|Mean median mode range;Data|Scatter plots;Data|Probability;Finance|Discount tax tip;Review|Mixed word problems');
const MATH_EXTRA_FLASHCARDS = toCards('Slope|Rise over run or change in y over change in x.;Y-intercept|The y value when x is 0.;y = mx + b|m is slope and b is y-intercept.;Direct variation|A line through the origin y = mx.;Partial variation|A linear relation with an initial value.;Constant rate|First differences are constant.;Like terms|Same variable and exponent.;Distributive property|a(b+c)=ab+ac.;Solving equations|Use inverse operations on both sides.;Integer signs|Same signs positive different signs negative for multiplication.;Fraction addition|Use common denominators.;Fraction multiplication|Multiply numerators and denominators.;Percent of number|Convert to decimal and multiply.;Percent increase|Original times one plus rate.;Percent decrease|Original times one minus rate.;Proportion|Two equal ratios.;Complementary angles|Add to 90 degrees.;Supplementary angles|Add to 180 degrees.;Opposite angles|Opposite angles are equal.;Triangle sum|Angles in a triangle add to 180.;Pythagorean theorem|a squared plus b squared equals c squared.;Area triangle|Base times height divided by 2.;Area trapezoid|Sum of bases times height divided by 2.;Circumference|2 pi r or pi d.;Area circle|pi r squared.;Volume prism|Base area times height.;Volume cylinder|pi r squared h.;Surface area|Total area of outside faces.;Mean|Sum divided by count.;Median|Middle ordered value.;Mode|Most frequent value.;Range|Largest minus smallest.;Probability|Favourable over total outcomes.;Unit rate|A rate per one unit.;Scale factor|Multiplier for enlargement or reduction.;Square root|Number that multiplies by itself.;Hypotenuse|Longest side of a right triangle.;Scatter trend|Positive rises negative falls.;Outlier|Data value far from the rest.;Check solution|Substitute answer back in.');
const MATH_EXTRA_QUIZ = [...cardQuiz(MATH_EXTRA_FLASHCARDS, 'math term'), { q: 'Slope between (2,5) and (6,13)?', choices: ['1','2','4','8'], answer: 1 }, { q: 'Solve 2x + 5 = 17.', choices: ['5','6','11','24'], answer: 1 }, { q: '35% of 80 is...', choices: ['18','28','35','45'], answer: 1 }, { q: 'Right triangle legs 3 and 4. Hypotenuse?', choices: ['5','6','7','25'], answer: 0 }];

// ============================================================
// HUMANITIES + FRENCH CONTENT (expanded from review packages)
// ============================================================

const HUMANITIES_VOCAB = [
  { word: 'disparity', definition: 'A great difference or inequality.' },
  { word: 'precarious', definition: 'Not securely held; dangerously likely to fall or collapse.' },
  { word: 'dubious', definition: 'Hesitating or doubting; not to be relied upon.' },
  { word: 'plausible', definition: 'Seeming reasonable or probable.' },
  { word: 'trepidation', definition: 'A feeling of fear or agitation about something that may happen.' },
  { word: 'chronic', definition: 'Persisting for a long time or constantly recurring.' },
  { word: 'mitigate', definition: 'Make less severe, serious, or painful.' },
  { word: 'deteriorate', definition: 'Become progressively worse.' },
  { word: 'aversion', definition: 'A strong dislike or disinclination.' },
  { word: 'meticulous', definition: 'Showing great attention to detail; very careful and precise.' },
  { word: 'inquisitive', definition: 'Curious or inquiring.' },
  { word: 'mundane', definition: 'Lacking interest or excitement; dull.' },
  { word: 'innocuous', definition: 'Not harmful or offensive.' },
  { word: 'inconceivable', definition: 'Not capable of being imagined; unbelievable.' },
  { word: 'apathy', definition: 'Lack of interest, enthusiasm, or concern.' },
  { word: 'desolate', definition: 'Deserted of people; bleak and dismal.' },
  { word: 'ration', definition: 'A fixed amount officially allowed during a shortage.' },
  { word: 'cynical', definition: 'Believing people are motivated by self-interest; distrustful.' },
  { word: 'plight', definition: 'A dangerous, difficult, or unfortunate situation.' },
  { word: 'traverse', definition: 'Travel across or through.' },
  { word: 'incessant', definition: 'Continuing without pause or interruption.' },
  { word: 'perilous', definition: 'Full of danger or risk.' },
  { word: 'disdain', definition: 'The feeling that someone or something is unworthy of respect; contempt.' },
  { word: 'subordinate', definition: 'Lower in rank or position.' },
  { word: 'conspicuous', definition: 'Standing out so as to be clearly visible.' },
  { word: 'drought', definition: 'A prolonged period of low rainfall causing water shortage.' },
  { word: 'compassion', definition: 'Sympathetic concern for the sufferings of others.' },
  { word: 'scarcity', definition: 'The state of being in short supply; rarity.' },
  { word: 'advocacy', definition: 'The act of supporting or arguing for a cause.' },
  { word: 'resourceful', definition: 'Able to find quick and clever ways to overcome difficulties.' },
  { word: 'isolation', definition: 'The state of being separated from others.' },
  { word: 'crisis', definition: 'A time of intense difficulty or danger.' },
  { word: 'impact', definition: 'The effect or influence of one thing on another.' },
  { word: 'melancholy', definition: 'A feeling of pensive sadness.' },
  { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere.' },
  { word: 'obstinate', definition: 'Stubbornly refusing to change one\'s opinion or course.' },
  { word: 'voracious', definition: 'Wanting or devouring great quantities.' },
  { word: 'rebellion', definition: 'Open resistance to an established government or authority.' },
  { word: 'allegory', definition: 'A story with a hidden meaning, typically moral or political.' },
  { word: 'totalitarianism', definition: 'A dictatorial system requiring complete subservience to the state.' },
  { word: 'laborious', definition: 'Requiring considerable effort and time; hard work.' },
  { word: 'manifest', definition: 'Display or show clearly by acts or appearance.' },
  { word: 'comrades', definition: 'Companions who share activities or are fellow members.' },
  { word: 'pervade', definition: 'Spread throughout all parts of something.' },
  { word: 'propaganda', definition: 'Biased or misleading information used to promote a cause.' },
  { word: 'tyranny', definition: 'Cruel and oppressive government or rule.' },
  { word: 'sedition', definition: 'Conduct or speech inciting rebellion against authority.' },
  { word: 'utopia', definition: 'An imagined place where everything is perfect.' },
  { word: 'industrious', definition: 'Diligently and steadily working; hard-working.' },
  { word: 'commodities', definition: 'Basic goods used in commerce, interchangeable with other goods of the same type.' },
  { word: 'sowing', definition: 'The act of planting seeds; introducing or spreading.' },
  { word: 'articulate', definition: 'Able to express thoughts and ideas clearly.' },
  { word: 'capitulate', definition: 'Cease to resist; surrender.' },
  { word: 'tactics', definition: 'Actions or strategies carefully planned to achieve a goal.' },
  { word: 'rhetoric', definition: 'The art of effective or persuasive speaking or writing.' },
  { word: 'uproarious', definition: 'Characterized by loud noise or uproar; very funny.' },
  { word: 'insurgent', definition: 'A person who rises in revolt against established authority.' },
  { word: 'cower', definition: 'Crouch down in fear; shrink away from something threatening.' },
  { word: 'reconcile', definition: 'Restore friendly relations; make peace.' },
  { word: 'deceive', definition: 'Cause someone to believe something untrue; mislead.' },
  { word: 'manipulate', definition: 'Control or influence cleverly, unfairly, or unscrupulously.' },
  { word: 'pseudonym', definition: 'A fictitious name, especially one used by an author.' },
  { word: 'enthralled', definition: 'Captivated or charmed completely.' },
  { word: 'reprimand', definition: 'Scold or criticize officially for wrongdoing.' },
  { word: 'famine', definition: 'A severe shortage of food causing widespread hunger.' },
  { word: 'complicity', definition: 'Involvement with others in illegal activity or wrongdoing.' },
  { word: 'dwindle', definition: 'Gradually decrease in size, amount, or strength.' },
  { word: 'reprieve', definition: 'A cancellation or postponement of punishment.' },
  { word: 'hoard', definition: 'Accumulate and store away items, often secretly.' },
  { word: 'allegiance', definition: 'Loyalty or commitment to a group or cause.' },
  { word: 'indifference', definition: 'Lack of interest, concern, or sympathy.' },
  { word: 'surreptitious', definition: 'Kept secret, especially because not approved of.' },
  { word: 'succumb', definition: 'Fail to resist pressure or temptation; yield.' },
  { word: 'falter', definition: 'Lose strength or momentum; hesitate.' },
  { word: 'commemorate', definition: 'Honor the memory of someone or something.' },
  { word: 'demeanor', definition: 'Outward behavior or bearing.' },
  { word: 'irrepressible', definition: 'Not able to be controlled or restrained.' },
  { word: 'rejuvenate', definition: 'Make someone or something look or feel younger or fresher.' },
  { word: 'raucous', definition: 'Making a disturbingly harsh and loud noise; disorderly.' },
  { word: 'retaliation', definition: 'The act of returning an injury; revenge.' }
];

const HUMANITIES_CONCEPT_CARDS = [
  { front: 'Complete sentence', back: 'Has a subject, predicate, and complete thought.' },
  { front: 'Fragment', back: 'An incomplete sentence missing subject, verb, or thought.' },
  { front: 'Run-on', back: 'Two or more complete thoughts joined incorrectly without proper punctuation.' },
  { front: 'Comma splice', back: 'Two complete sentences joined only by a comma. Fix with period, semicolon, or conjunction.' },
  { front: 'Subject', back: 'The person, place, or thing performing the action.' },
  { front: 'Predicate', back: 'The part of the sentence containing the verb and information about the subject.' },
  { front: 'Noun', back: 'A person, place, thing, or idea.' },
  { front: 'Verb', back: 'An action or state of being.' },
  { front: 'Adjective', back: 'A word describing a noun.' },
  { front: 'Adverb', back: 'A word describing a verb, adjective, or another adverb.' },
  { front: 'Pronoun', back: 'A word that replaces a noun. Ex: he, she, they.' },
  { front: 'Subject Opener', back: 'Sentence starts with the subject. Ex: I, We, The class...' },
  { front: 'Prepositional Opener', back: 'Starts with a preposition. Ex: Between, In, On, Over...' },
  { front: 'LY Opener', back: 'Starts with an -ly adverb. Ex: Quickly, Cautiously, Proudly...' },
  { front: 'ING Opener', back: 'Starts with an -ing word. Ex: Running, Reading, Asking...' },
  { front: 'Clausal Opener', back: 'Starts with When, As, If, Although, Since, While, Because...' },
  { front: 'VSS Opener', back: 'Very Short Sentence (3 words or less) for effect. Ex: Stop. Wow! It was.' },
  { front: 'ED/Adjective Opener', back: 'Starts with a past participle or adjective. Ex: Exhausted, Excited, Frustrated...' },
  { front: 'Topic sentence', back: 'The main idea sentence of a paragraph, usually first.' },
  { front: 'Conclusion sentence', back: 'Wraps up the paragraph; should be thought-provoking, not a simple repeat.' },
  { front: 'Inference', back: 'A conclusion reached by reasoning from clues in the text.' },
  { front: 'Annotation', back: 'Notes and marks made on a text while reading.' },
  { front: 'Theme', back: 'The central message or big idea of a story.' },
  { front: 'POV (Point of View)', back: 'Perspective the story is told from: 1st person (I), 2nd (you), 3rd limited, 3rd omniscient.' },
  { front: 'Setting', back: 'Where and when a story takes place.' },
  { front: 'Characterization', back: 'How an author shows what a character is like.' },
  { front: 'Plot', back: 'The sequence of events in a story.' },
  { front: 'Exposition', back: 'The beginning of the story; introduces setting, characters, situation.' },
  { front: 'Turning point', back: 'The moment that changes the direction of the story; sits between exposition and rising action.' },
  { front: 'Rising action', back: 'Events building tension toward the climax.' },
  { front: 'Climax', back: 'The peak of the story; the most intense moment.' },
  { front: 'Falling action', back: 'Events after the climax leading toward resolution.' },
  { front: 'Resolution', back: 'How the story ends and conflicts are resolved.' },
  { front: 'Conflict', back: 'The struggle in a story: person vs person, vs self, vs nature, vs society.' }
];

const HUMANITIES_POETIC_CARDS = [
  { front: 'Alliteration', back: 'Repeated sounds at the beginning of two or more words close together. Ex: rolled round the rugged rocks.' },
  { front: 'Imagery', back: 'Language that evokes the five senses. Ex: the smell of an empty house.' },
  { front: 'Personification', back: 'Giving non-human things human qualities. Ex: the wind whispered.' },
  { front: 'Simile', back: 'Comparing two things using like or as. Ex: her smile was like the sun.' },
  { front: 'Metaphor', back: 'Comparing two things WITHOUT using like or as; one thing IS another. Ex: a book is a ship.' },
  { front: 'Internal Rhyme', back: 'Two words that rhyme in the same line. Ex: the gloom of the tomb may loom.' },
  { front: 'Rhyme Scheme', back: 'Pattern of end rhymes (AABB, ABAB, etc).' },
  { front: 'Onomatopoeia', back: 'Words that sound like their meaning. Ex: tinkle, clink, buzz.' },
  { front: 'Hyperbole', back: 'Exaggeration for effect. Ex: I\'ve told you a million times.' },
  { front: 'Oxymoron', back: 'Two opposite words used together. Ex: bittersweet, freezer burn.' },
  { front: 'Irony', back: 'Situation or use of language opposite to what one expects. Ex: winning the lottery and dying the next day.' },
  { front: 'Symbolism', back: 'Using objects to represent ideas. Ex: vultures = death.' },
  { front: 'Tone', back: 'The author\'s attitude in writing. Ex: an apologetic tone.' },
  { front: 'Mood', back: 'The reader\'s emotional response/atmosphere of a piece.' },
  { front: 'Allegory', back: 'A story with hidden deeper meaning beyond the surface. Ex: \'The Sacred Rac\' is an allegory about cars.' },
  { front: 'Allusion', back: 'A brief reference to a person, place, event, or other work. Ex: Daniel referencing 1001 Nights in ESIU.' },
  { front: 'Stanza', back: 'A group of lines forming a unit in a poem (like a verse).' }
];

const HUMANITIES_TRANSITION_CARDS = [
  { front: 'Add ideas', back: 'Also, Besides, Furthermore, In addition, Additionally.' },
  { front: 'Elaborate', back: 'Actually, By extension, Ultimately.' },
  { front: 'Compare', back: 'Likewise, Similarly, Along the same lines.' },
  { front: 'Contrast', back: 'Although, By contrast, Despite, However, Nevertheless, On the contrary, Conversely.' },
  { front: 'Examples', back: 'For instance, Specifically, Consider, Case in point.' },
  { front: 'Concede', back: 'Admittedly, Granted, Of course, To be sure.' },
  { front: 'Make a claim', back: 'Argue, Believe, Observe, Suggest.' },
  { front: 'Recommend', back: 'Advocate, Call for, Encourage, Urge, Recommend.' },
  { front: 'Agree', back: 'Acknowledge, Agree, Corroborate, Support.' },
  { front: 'Disagree/Question', back: 'Contend, Contradict, Deny, Question, Refute.' }
];

const HUMANITIES_FILL = [
  { q: 'The significant ___ in wealth between richest and poorest citizens is a growing concern.', answer: 'disparity' },
  { q: 'His explanation for being late seemed ___, even though I had my doubts.', answer: 'plausible' },
  { q: 'Over time, the old wooden bridge began to ___, making it unsafe to cross.', answer: 'deteriorate' },
  { q: 'The ___ child constantly asked \'why?\' about everything.', answer: 'inquisitive' },
  { q: 'A wave of ___ washed over the crowd as the speaker droned on about irrelevant topics.', answer: 'apathy' },
  { q: 'The ___ buzzing of the mosquitoes kept us awake all night.', answer: 'incessant' },
  { q: 'Farmers worried about their crops during the prolonged ___, as the land became parched.', answer: 'drought' },
  { q: 'Being ___, she managed to fix the broken appliance with only a few tools.', answer: 'resourceful' },
  { q: 'Despite all our efforts to persuade him, he remained ___ in his decision.', answer: 'obstinate' },
  { q: 'The novel is often interpreted as an ___ for the political climate of the time.', answer: 'allegory' },
  { q: 'The soldiers considered themselves loyal ___, fighting side-by-side.', answer: 'comrades' },
  { q: 'Spring is the season for ___ seeds and anticipating a future harvest.', answer: 'sowing' },
  { q: 'The government struggled to quell the ___ forces that sought to overthrow it.', answer: 'insurgent' },
  { q: 'The teacher had to ___ the students for their disruptive behavior in the library.', answer: 'reprimand' },
  { q: 'Our supplies began to ___ as the journey took longer than expected.', answer: 'dwindle' },
  { q: 'Balancing on the edge of the cliff, the hiker found himself in a ___ situation.', answer: 'precarious' },
  { q: 'His explanation for the missing money seemed ___, and the detective remained skeptical.', answer: 'dubious' },
  { q: 'She had a strong ___ to public speaking, often feeling anxious before presentations.', answer: 'aversion' },
  { q: 'Winning the lottery seemed ___ to him, a dream that would never come true.', answer: 'inconceivable' },
  { q: 'Crossing the raging river in a small boat was a ___ undertaking.', answer: 'perilous' },
  { q: 'As a ___ officer, he always followed the captain\'s orders without question.', answer: 'subordinate' },
  { q: 'A wave of ___ washed over her as she remembered her lost loved ones.', answer: 'melancholy' },
  { q: 'The citizens staged a ___ against the oppressive regime.', answer: 'rebellion' },
  { q: 'Living under a ___, the people had no freedom of speech or expression.', answer: 'tyranny' },
  { q: 'The comedian\'s jokes were so ___ that the entire audience was laughing uncontrollably.', answer: 'uproarious' },
  { q: 'The frightened dog began to ___ in the corner during the thunderstorm.', answer: 'cower' },
  { q: 'He tried to ___ his friends into agreeing with his plan.', answer: 'manipulate' },
  { q: 'The prolonged ___ led to widespread starvation in the region.', answer: 'famine' },
  { q: 'Driven by fear of scarcity, he began to ___ canned goods and other supplies.', answer: 'hoard' },
  { q: 'They exchanged ___ glances, hoping no one would notice their secret.', answer: 'surreptitious' },
  { q: 'She felt a sense of ___ as she approached the dark and unfamiliar house.', answer: 'trepidation' },
  { q: 'Planting trees can help ___ the effects of soil erosion.', answer: 'mitigate' },
  { q: 'His job was quite ___, involving the same routine tasks every day.', answer: 'mundane' },
  { q: 'The abandoned building stood ___ against the stormy sky.', answer: 'desolate' },
  { q: 'During the emergency, water was strictly put on ___ to ensure everyone received a fair share.', answer: 'ration' },
  { q: 'He felt a sense of ___ for those who treated others with disrespect.', answer: 'disdain' },
  { q: 'The economic ___ led to widespread job losses and financial hardship.', answer: 'crisis' },
  { q: 'The new regulations are expected to have a significant ___ on the industry.', answer: 'impact' },
  { q: 'Under ___, the government had absolute control over every aspect of citizens\' lives.', answer: 'totalitarianism' },
  { q: 'The speaker was able to ___ her ideas clearly and persuasively to the audience.', answer: 'articulate' },
  { q: 'After hours of negotiation, the opposing side finally agreed to ___.', answer: 'capitulate' },
  { q: 'It took many years for the two families to ___ after the long-standing feud.', answer: 'reconcile' },
  { q: 'The children were ___ by the captivating story the storyteller shared.', answer: 'enthralled' },
  { q: 'His complete ___ to the suffering of others was disturbing.', answer: 'indifference' },
  { q: 'Her voice began to ___ as she recounted the tragic events.', answer: 'falter' },
  { q: 'He suffered from a ___ back pain that had bothered him for years.', answer: 'chronic' },
  { q: 'After being repeatedly disappointed, she developed a ___ view of human nature.', answer: 'cynical' },
  { q: 'Hikers need to be careful when they ___ the steep mountain trails.', answer: 'traverse' },
  { q: 'Her bright red coat made her ___ in the crowded room.', answer: 'conspicuous' },
  { q: 'The ___ of clean water became a major issue during the prolonged dry spell.', answer: 'scarcity' },
  { q: 'Living in complete ___ can lead to feelings of loneliness and detachment.', answer: 'isolation' },
  { q: 'The ___ reader devoured every book they could find.', answer: 'voracious' },
  { q: 'Building the stone wall was a ___ task that took many weeks to complete.', answer: 'laborious' },
  { q: 'A feeling of unease seemed to ___ the entire village after the strange incident.', answer: 'pervade' },
  { q: 'The government used ___ to sway public opinion in favor of its policies.', answer: 'propaganda' },
  { q: 'In their vision of ___, there would be no poverty, hunger, or war.', answer: 'utopia' },
  { q: 'The general outlined the military ___ they would use to win the battle.', answer: 'tactics' },
  { q: 'He tried to ___ his parents into believing he had studied by hiding his video games.', answer: 'deceive' },
  { q: 'The prisoner received a temporary ___ from his sentence due to good behavior.', answer: 'reprieve' },
  { q: 'Despite his best efforts to resist, he eventually had to ___ to temptation and ate the entire cake.', answer: 'succumb' },
  { q: 'The jeweler was ___ in his work, carefully inspecting every facet of the diamond.', answer: 'meticulous' },
  { q: 'The devastating flood brought the ___ of the homeless families to the attention of the nation.', answer: 'plight' },
  { q: 'Showing ___, she offered a comforting hand to the grieving widow.', answer: 'compassion' },
  { q: 'Her tireless ___ for animal rights led to significant changes in local shelters.', answer: 'advocacy' },
  { q: 'Smartphones have become ___; it seems like everyone owns one.', answer: 'ubiquitous' },
  { q: 'His anxiety began to ___ itself in physical symptoms like headaches and stomachaches.', answer: 'manifest' },
  { q: 'The group was accused of ___ for their speeches encouraging resistance against the government.', answer: 'sedition' },
  { q: 'Known for being ___, she consistently completed all her tasks ahead of schedule.', answer: 'industrious' },
  { q: 'Wheat, oil, and coffee are examples of important global ___.', answer: 'commodities' },
  { q: 'The politician\'s powerful ___ moved the audience and garnered significant support.', answer: 'rhetoric' },
  { q: 'The author chose to publish her controversial novel under a ___.', answer: 'pseudonym' },
  { q: 'His ___ in the crime made him just as guilty as the person who committed it.', answer: 'complicity' },
  { q: 'Citizens swear an oath of ___ to their country.', answer: 'allegiance' },
  { q: 'A monument was erected to ___ the soldiers who died in the war.', answer: 'commemorate' },
  { q: 'A good night\'s sleep can help to ___ both the mind and body.', answer: 'rejuvenate' },
  { q: 'Fearing ___, the witness hesitated to testify against the powerful criminal.', answer: 'retaliation' },
  { q: 'His calm and professional ___ put everyone at ease during the tense meeting.', answer: 'demeanor' },
  { q: 'The ___ cheering of the crowd made it difficult to hear the speaker.', answer: 'raucous' },
  { q: 'Despite numerous setbacks, her optimistic spirit remained ___.', answer: 'irrepressible' }
];

const FRENCH_ER_VERBS = [
  { word: 'chanter', definition: 'to sing' },
  { word: 'danser', definition: 'to dance' },
  { word: 'écouter', definition: 'to listen' },
  { word: 'étudier', definition: 'to study' },
  { word: 'jouer', definition: 'to play' },
  { word: 'manger', definition: 'to eat' },
  { word: 'nager', definition: 'to swim' },
  { word: 'parler', definition: 'to speak' },
  { word: 'regarder', definition: 'to watch' },
  { word: 'téléphoner', definition: 'to telephone' },
  { word: 'travailler', definition: 'to work' },
  { word: 'voyager', definition: 'to travel' },
  { word: 'aimer', definition: 'to like/love' },
  { word: 'habiter', definition: 'to live' },
  { word: 'porter', definition: 'to wear/carry' },
  { word: 'organiser', definition: 'to organize' },
  { word: 'visiter', definition: 'to visit' },
  { word: 'acheter', definition: 'to buy' }
];

const FRENCH_IR_VERBS = [
  { word: 'choisir', definition: 'to choose' },
  { word: 'finir', definition: 'to finish' },
  { word: 'grandir', definition: 'to grow' },
  { word: 'réussir', definition: 'to succeed' }
];

const FRENCH_RE_VERBS = [
  { word: 'attendre', definition: 'to wait' },
  { word: 'entendre', definition: 'to hear' },
  { word: 'perdre', definition: 'to lose' },
  { word: 'rendre visite à', definition: 'to visit (a person)' },
  { word: 'répondre à', definition: 'to answer' },
  { word: 'vendre', definition: 'to sell' }
];

const FRENCH_CONJUGATION_DRILLS_FULL = [
  { prompt: 'parler — je', answer: 'parle' },
  { prompt: 'parler — tu', answer: 'parles' },
  { prompt: 'parler — il/elle/on', answer: 'parle' },
  { prompt: 'parler — nous', answer: 'parlons' },
  { prompt: 'parler — vous', answer: 'parlez' },
  { prompt: 'parler — ils/elles', answer: 'parlent' },
  { prompt: 'finir — je', answer: 'finis' },
  { prompt: 'finir — tu', answer: 'finis' },
  { prompt: 'finir — il/elle/on', answer: 'finit' },
  { prompt: 'finir — nous', answer: 'finissons' },
  { prompt: 'finir — vous', answer: 'finissez' },
  { prompt: 'finir — ils/elles', answer: 'finissent' },
  { prompt: 'vendre — je', answer: 'vends' },
  { prompt: 'vendre — tu', answer: 'vends' },
  { prompt: 'vendre — il/elle/on', answer: 'vend' },
  { prompt: 'vendre — nous', answer: 'vendons' },
  { prompt: 'vendre — vous', answer: 'vendez' },
  { prompt: 'vendre — ils/elles', answer: 'vendent' },
  { prompt: 'être — je', answer: 'suis' },
  { prompt: 'être — tu', answer: 'es' },
  { prompt: 'être — il/elle/on', answer: 'est' },
  { prompt: 'être — nous', answer: 'sommes' },
  { prompt: 'être — vous', answer: 'êtes' },
  { prompt: 'être — ils/elles', answer: 'sont' },
  { prompt: 'avoir — j\'', answer: 'ai' },
  { prompt: 'avoir — tu', answer: 'as' },
  { prompt: 'avoir — il/elle/on', answer: 'a' },
  { prompt: 'avoir — nous', answer: 'avons' },
  { prompt: 'avoir — vous', answer: 'avez' },
  { prompt: 'avoir — ils/elles', answer: 'ont' },
  { prompt: 'aller — je', answer: 'vais' },
  { prompt: 'aller — tu', answer: 'vas' },
  { prompt: 'aller — il/elle/on', answer: 'va' },
  { prompt: 'aller — nous', answer: 'allons' },
  { prompt: 'aller — vous', answer: 'allez' },
  { prompt: 'aller — ils/elles', answer: 'vont' },
  { prompt: 'faire — je', answer: 'fais' },
  { prompt: 'faire — tu', answer: 'fais' },
  { prompt: 'faire — il/elle/on', answer: 'fait' },
  { prompt: 'faire — nous', answer: 'faisons' },
  { prompt: 'faire — vous', answer: 'faites' },
  { prompt: 'faire — ils/elles', answer: 'font' },
  { prompt: 'vouloir — je', answer: 'veux' },
  { prompt: 'vouloir — tu', answer: 'veux' },
  { prompt: 'vouloir — il/elle/on', answer: 'veut' },
  { prompt: 'vouloir — nous', answer: 'voulons' },
  { prompt: 'vouloir — vous', answer: 'voulez' },
  { prompt: 'vouloir — ils/elles', answer: 'veulent' },
  { prompt: 'prendre — je', answer: 'prends' },
  { prompt: 'prendre — tu', answer: 'prends' },
  { prompt: 'prendre — il/elle/on', answer: 'prend' },
  { prompt: 'prendre — nous', answer: 'prenons' },
  { prompt: 'prendre — vous', answer: 'prenez' },
  { prompt: 'prendre — ils/elles', answer: 'prennent' },
  { prompt: 'boire — je', answer: 'bois' },
  { prompt: 'boire — tu', answer: 'bois' },
  { prompt: 'boire — il/elle/on', answer: 'boit' },
  { prompt: 'boire — nous', answer: 'buvons' },
  { prompt: 'boire — vous', answer: 'buvez' },
  { prompt: 'boire — ils/elles', answer: 'boivent' },
  { prompt: 'pouvoir — je', answer: 'peux' },
  { prompt: 'pouvoir — tu', answer: 'peux' },
  { prompt: 'pouvoir — il/elle/on', answer: 'peut' },
  { prompt: 'pouvoir — nous', answer: 'pouvons' },
  { prompt: 'pouvoir — vous', answer: 'pouvez' },
  { prompt: 'pouvoir — ils/elles', answer: 'peuvent' },
  { prompt: 'devoir — je', answer: 'dois' },
  { prompt: 'devoir — tu', answer: 'dois' },
  { prompt: 'devoir — il/elle/on', answer: 'doit' },
  { prompt: 'devoir — nous', answer: 'devons' },
  { prompt: 'devoir — vous', answer: 'devez' },
  { prompt: 'devoir — ils/elles', answer: 'doivent' }
];

const FRENCH_PARTICIPLE_DRILLS = [
  { prompt: 'être', answer: 'été' },
  { prompt: 'avoir', answer: 'eu' },
  { prompt: 'faire', answer: 'fait' },
  { prompt: 'mettre', answer: 'mis' },
  { prompt: 'voir', answer: 'vu' },
  { prompt: 'vouloir', answer: 'voulu' },
  { prompt: 'prendre', answer: 'pris' },
  { prompt: 'boire', answer: 'bu' },
  { prompt: 'pouvoir', answer: 'pu' },
  { prompt: 'devoir', answer: 'dû' },
  { prompt: 'aller', answer: 'allé' },
  { prompt: 'arriver', answer: 'arrivé' },
  { prompt: 'rentrer', answer: 'rentré' },
  { prompt: 'rester', answer: 'resté' },
  { prompt: 'venir', answer: 'venu' },
  { prompt: 'manger past participle', answer: 'mangé' },
  { prompt: 'finir past participle', answer: 'fini' },
  { prompt: 'vendre past participle', answer: 'vendu' },
  { prompt: 'parler past participle', answer: 'parlé' },
  { prompt: 'danser past participle', answer: 'dansé' },
  { prompt: 'choisir past participle', answer: 'choisi' },
  { prompt: 'attendre past participle', answer: 'attendu' },
  { prompt: 'perdre past participle', answer: 'perdu' }
];

const FRENCH_PC_DRILLS = [
  { prompt: 'Tu (attendre) au passé composé', answer: 'as attendu' },
  { prompt: 'Il (choisir)', answer: 'a choisi' },
  { prompt: 'Nous (chanter)', answer: 'avons chanté' },
  { prompt: 'Vous (danser)', answer: 'avez dansé' },
  { prompt: 'Je (dîner)', answer: 'ai dîné' },
  { prompt: 'Les garçons (écouter)', answer: 'ont écouté' },
  { prompt: 'Mr. Parsons (entendre)', answer: 'a entendu' },
  { prompt: 'Les filles (finir)', answer: 'ont fini' },
  { prompt: 'Ma famille (étudier)', answer: 'a étudié' },
  { prompt: 'La classe (jouer)', answer: 'a joué' },
  { prompt: 'Elle (manger)', answer: 'a mangé' },
  { prompt: 'Ils (nager)', answer: 'ont nagé' },
  { prompt: 'Elles (parler)', answer: 'ont parlé' },
  { prompt: 'Je (perdre)', answer: 'ai perdu' },
  { prompt: 'Tu (grossir)', answer: 'as grossi' },
  { prompt: 'Nous (regarder)', answer: 'avons regardé' },
  { prompt: 'Ils (voyager)', answer: 'ont voyagé' },
  { prompt: 'Elles (rendre visite à)', answer: 'ont rendu visite à' },
  { prompt: 'On (maigrir)', answer: 'a maigri' },
  { prompt: 'Vous (travailler)', answer: 'avez travaillé' },
  { prompt: 'Ils (répondre à)', answer: 'ont répondu à' },
  { prompt: 'Tu (réussir)', answer: 'as réussi' },
  { prompt: 'Elle (aimer)', answer: 'a aimé' },
  { prompt: 'Nous (habiter)', answer: 'avons habité' },
  { prompt: 'On (inviter)', answer: 'a invité' },
  { prompt: 'La classe (vendre)', answer: 'a vendu' },
  { prompt: 'Nous (organiser)', answer: 'avons organisé' },
  { prompt: 'Tu (être)', answer: 'as été' },
  { prompt: 'Il (avoir)', answer: 'a eu' },
  { prompt: 'Nous (faire)', answer: 'avons fait' },
  { prompt: 'Vous (mettre)', answer: 'avez mis' },
  { prompt: 'Je (voir)', answer: 'ai vu' },
  { prompt: 'Les garçons (vouloir)', answer: 'ont voulu' },
  { prompt: 'Mr. Parsons (prendre)', answer: 'a pris' },
  { prompt: 'Les filles (boire)', answer: 'ont bu' },
  { prompt: 'Ma famille (pouvoir)', answer: 'a pu' },
  { prompt: 'La classe (devoir)', answer: 'a dû' },
  { prompt: 'Je (aller) - I went', answer: 'suis allé(e)' },
  { prompt: 'Nous (arriver) - we arrived', answer: 'sommes arrivé(e)s' },
  { prompt: 'Elles (rentrer) - they returned', answer: 'sont rentrées' },
  { prompt: 'La classe (rester) - the class stayed', answer: 'est restée' },
  { prompt: 'Les garçons (venir) - the boys came', answer: 'sont venus' },
  { prompt: 'Vous (aller)', answer: 'êtes allé(e)(s)' },
  { prompt: 'Ils (arriver)', answer: 'sont arrivés' },
  { prompt: 'Tu (rentrer)', answer: 'es rentré(e)' },
  { prompt: 'La fille (rester)', answer: 'est restée' },
  { prompt: 'Il (venir)', answer: 'est venu' },
  { prompt: 'Elle (aller)', answer: 'est allée' },
  { prompt: 'Mr. Parsons (arriver)', answer: 'est arrivé' },
  { prompt: 'Les voisins (rentrer)', answer: 'sont rentrés' },
  { prompt: 'Charlie et Jack (venir)', answer: 'sont venus' },
  { prompt: 'Tes cousins (venir)', answer: 'sont venus' },
  { prompt: 'Mes copines (aller)', answer: 'sont allées' },
  { prompt: 'Sa famille (arriver)', answer: 'est arrivée' },
  { prompt: 'Ton frère (rester)', answer: 'est resté' },
  { prompt: 'Sa soeur (venir)', answer: 'est venue' }
];

const FRENCH_FP_DRILLS = [
  { prompt: 'They are going to swim.', answer: 'Ils vont nager.' },
  { prompt: 'Paul and Marc are going to play tennis.', answer: 'Paul et Marc vont jouer au tennis.' },
  { prompt: 'We are going to stay home.', answer: 'Nous allons rester à la maison.' },
  { prompt: 'I am going to go downtown.', answer: 'Je vais aller au centre-ville.' },
  { prompt: 'You (pl.) are going to visit your grandparents.', answer: 'Vous allez rendre visite à vos grands-parents.' },
  { prompt: 'He is going to eat a sandwich.', answer: 'Il va manger un sandwich.' },
  { prompt: 'Elle visite la maison de sa grand-mère. (futur proche)', answer: 'Elle va visiter la maison de sa grand-mère.' },
  { prompt: 'Ils jouent au baseball au parc. (futur proche)', answer: 'Ils vont jouer au baseball au parc.' },
  { prompt: 'Nous mangeons de la pizza avec du pepperoni. (futur proche)', answer: 'Nous allons manger de la pizza avec du pepperoni.' },
  { prompt: 'Je finis tous les devoirs de maths à la bibliothèque. (futur proche)', answer: 'Je vais finir tous les devoirs de maths à la bibliothèque.' },
  { prompt: 'Vous choisissez le film Jurassic Park. (futur proche)', answer: 'Vous allez choisir le film Jurassic Park.' },
  { prompt: 'Tu as bu un jus d\'orange. (passé composé → futur proche)', answer: 'Tu vas boire un jus d\'orange.' },
  { prompt: 'Il a écouté les instructions de Mr. Dubois. (futur proche)', answer: 'Il va écouter les instructions de Mr. Dubois.' },
  { prompt: 'Elles ont dansé à la boum samedi soir. (futur proche)', answer: 'Elles vont danser à la boum samedi soir.' }
];

const FRENCH_NEGATIVE_DRILLS = [
  { prompt: 'Nous allons jouer au baseball.', answer: 'Nous n\'allons pas jouer au baseball.' },
  { prompt: 'Tu as une grande maison.', answer: 'Tu n\'as pas une grande maison.' },
  { prompt: 'Vous avez mangé au restaurant de Luigi.', answer: 'Vous n\'avez pas mangé au restaurant de Luigi.' },
  { prompt: 'J\'aime jouer avec mes amis.', answer: 'Je n\'aime pas jouer avec mes amis.' },
  { prompt: 'Il a parlé avec son ami Sam.', answer: 'Il n\'a pas parlé avec son ami Sam.' },
  { prompt: 'Les filles sont dans une pièce de théâtre.', answer: 'Les filles ne sont pas dans une pièce de théâtre.' },
  { prompt: 'Elle va chanter pour ses amies.', answer: 'Elle ne va pas chanter pour ses amies.' },
  { prompt: 'Le garçon a mis son chapeau sur sa tête.', answer: 'Le garçon n\'a pas mis son chapeau sur sa tête.' },
  { prompt: 'On va regarder un film vendredi soir.', answer: 'On ne va pas regarder un film vendredi soir.' },
  { prompt: 'J\'achète beaucoup de vêtements au centre commercial.', answer: 'Je n\'achète pas beaucoup de vêtements au centre commercial.' },
  { prompt: 'Il est allé au cinéma samedi soir. (négatif)', answer: 'Il n\'est pas allé au cinéma samedi soir.' },
  { prompt: 'Nous sommes restés à la maison ce weekend. (négatif)', answer: 'Nous ne sommes pas restés à la maison ce weekend.' },
  { prompt: 'Je suis rentré chez moi à 4 heures.', answer: 'Je ne suis pas rentré chez moi à 4 heures.' },
  { prompt: 'Tu es venu à l\'école à 8 heures.', answer: 'Tu n\'es pas venu à l\'école à 8 heures.' },
  { prompt: 'Vous êtes arrivés à la boum à 9 heures.', answer: 'Vous n\'êtes pas arrivés à la boum à 9 heures.' }
];

const FRENCH_ADJECTIVE_DRILLS = [
  { prompt: 'Cet enfant mange trop de plats ___ (sucré).', answer: 'sucrés' },
  { prompt: 'Cette année, les pluies ont été ___ (abondant).', answer: 'abondantes' },
  { prompt: 'Que cette femme est ___ (nerveux).', answer: 'nerveuse' },
  { prompt: 'Les enfants avaient mis leurs chemises ___ (rose).', answer: 'roses' },
  { prompt: 'Magalie et Sandrine sont très ___ (coquet).', answer: 'coquettes' },
  { prompt: 'Ces jeunes filles sont vraiment ___ (intelligent).', answer: 'intelligentes' },
  { prompt: 'J\'aimerais bien acheter ces pantalons, mais ils sont trop ___ (grand) pour moi.', answer: 'grands' },
  { prompt: 'Ces deux fillettes sont vraiment très ___ (gentil).', answer: 'gentilles' },
  { prompt: 'Les poneys, avec leurs robes ___ (fauve), sont magnifiques.', answer: 'fauves' },
  { prompt: 'Ces fleurs ___ (blanc) vont être livrées demain.', answer: 'blanches' }
];

const FRENCH_TRANSLATION_DRILLS = [
  { prompt: 'Jacques is a big man who loves to travel.', answer: 'Jacques est un grand homme qui aime voyager.' },
  { prompt: 'His pastimes are playing hockey and singing.', answer: 'Ses passe-temps sont jouer au hockey et chanter.' },
  { prompt: 'He works a lot more now than before.', answer: 'Il travaille beaucoup plus maintenant qu\'avant.' },
  { prompt: 'Last weekend, he water skied with his friends.', answer: 'La fin de semaine passée, il a fait du ski nautique avec ses amis.' },
  { prompt: 'Next year, he will go to Japan to see Mount Fuji.', answer: 'L\'année prochaine, il va aller au Japon pour voir le Mont Fuji.' },
  { prompt: 'He has a wife, a son, a young daughter and an old dog.', answer: 'Il a une femme, un fils, une jeune fille et un vieux chien.' },
  { prompt: 'Il va aller à l\'école. (passé composé)', answer: 'Il est allé à l\'école.' },
  { prompt: 'J\'ai mangé mon dîner. (futur proche)', answer: 'Je vais manger mon dîner.' },
  { prompt: 'Je vais jouer au tennis. (passé composé)', answer: 'J\'ai joué au tennis.' },
  { prompt: 'Mes amis ont regardé un film. (futur proche)', answer: 'Mes amis vont regarder un film.' },
  { prompt: 'Vous allez dîner ce soir. (passé composé)', answer: 'Vous avez dîné ce soir.' },
  { prompt: 'Nous allons commander une pizza. (passé composé)', answer: 'Nous avons commandé une pizza.' },
  { prompt: 'Les filles vont descendre. (passé composé)', answer: 'Les filles sont descendues.' },
  { prompt: 'Je vais faire mes devoirs. (passé composé)', answer: 'J\'ai fait mes devoirs.' },
  { prompt: 'Les étudiants vont finir leur examen. (passé composé)', answer: 'Les étudiants ont fini leur examen.' },
  { prompt: 'Vous allez passer votre fin de semaine chez vos grands-parents? (passé composé)', answer: 'Vous avez passé votre fin de semaine chez vos grands-parents?' }
];


// ============================================================
// HUMANITIES TOPICS — granular, organized by exam section
// ============================================================
const HUMANITIES_TOPICS = [
  // Section A — Content/Concepts
  { id: 'hum-1',  unit: 'Grammar',         title: 'Complete sentences vs fragments' },
  { id: 'hum-2',  unit: 'Grammar',         title: 'Run-on sentences and comma splices' },
  { id: 'hum-3',  unit: 'Grammar',         title: 'Past vs present tense consistency' },
  { id: 'hum-4',  unit: 'Sentence Openers',title: '7 sentence opener types' },
  { id: 'hum-5',  unit: 'Sentence Openers',title: 'Subject opener (default; avoid overuse)' },
  { id: 'hum-6',  unit: 'Sentence Openers',title: 'Prepositional opener (Between, In, On)' },
  { id: 'hum-7',  unit: 'Sentence Openers',title: 'LY opener (Quickly, Cautiously)' },
  { id: 'hum-8',  unit: 'Sentence Openers',title: 'ING opener (Running, Reading)' },
  { id: 'hum-9',  unit: 'Sentence Openers',title: 'Clausal opener (When, As, If, Although)' },
  { id: 'hum-10', unit: 'Sentence Openers',title: 'VSS opener (3 words or less)' },
  { id: 'hum-11', unit: 'Sentence Openers',title: 'ED/Adjective opener (Exhausted, Excited)' },
  { id: 'hum-12', unit: 'Punctuation',     title: 'Commas — series, after openers, in dialogue' },
  { id: 'hum-13', unit: 'Punctuation',     title: 'Apostrophes — possession and contractions' },
  { id: 'hum-14', unit: 'Punctuation',     title: 'Periods, question marks, exclamation marks' },
  { id: 'hum-15', unit: 'Punctuation',     title: 'Quotation marks for dialogue and titles' },
  { id: 'hum-16', unit: 'Punctuation',     title: 'Capital letters — names, titles, sentence start' },
  { id: 'hum-17', unit: 'Punctuation',     title: 'Italicizing or underlining book titles' },
  { id: 'hum-18', unit: 'Poetic Devices',  title: 'Simile (using like or as)' },
  { id: 'hum-19', unit: 'Poetic Devices',  title: 'Metaphor (X is Y, no like or as)' },
  { id: 'hum-20', unit: 'Poetic Devices',  title: 'Imagery (5 senses)' },
  { id: 'hum-21', unit: 'Poetic Devices',  title: 'Alliteration (repeated start sounds)' },
  { id: 'hum-22', unit: 'Poetic Devices',  title: 'Personification (human qualities)' },
  { id: 'hum-23', unit: 'Poetic Devices',  title: 'Hyperbole (exaggeration)' },
  { id: 'hum-24', unit: 'Poetic Devices',  title: 'Onomatopoeia (sounds-like words)' },
  { id: 'hum-25', unit: 'Poetic Devices',  title: 'Oxymoron (opposites paired)' },
  { id: 'hum-26', unit: 'Poetic Devices',  title: 'Irony (opposite of expected)' },
  { id: 'hum-27', unit: 'Poetic Devices',  title: 'Symbol/Symbolism (objects = ideas)' },
  { id: 'hum-28', unit: 'Poetic Devices',  title: 'Tone vs Mood' },
  { id: 'hum-29', unit: 'Poetic Devices',  title: 'Internal rhyme and rhyme scheme' },
  { id: 'hum-30', unit: 'Poetic Devices',  title: 'Stanza' },
  { id: 'hum-31', unit: 'Poetic Devices',  title: 'Allegory (hidden deeper meaning)' },
  { id: 'hum-32', unit: 'Poetic Devices',  title: 'Allusion (brief reference to other work)' },
  { id: 'hum-33', unit: 'Story Structure', title: 'Exposition (beginning)' },
  { id: 'hum-34', unit: 'Story Structure', title: 'Turning point (between exposition and rising)' },
  { id: 'hum-35', unit: 'Story Structure', title: 'Rising action (building tension)' },
  { id: 'hum-36', unit: 'Story Structure', title: 'Climax (peak)' },
  { id: 'hum-37', unit: 'Story Structure', title: 'Falling action and resolution' },
  { id: 'hum-38', unit: 'Story Elements',  title: 'POV (1st, 2nd, 3rd limited, 3rd omniscient)' },
  { id: 'hum-39', unit: 'Story Elements',  title: 'Setting and characterization' },
  { id: 'hum-40', unit: 'Story Elements',  title: 'Theme (central message)' },
  { id: 'hum-41', unit: 'Story Elements',  title: 'Conflict (vs person, self, nature, society)' },
  { id: 'hum-42', unit: 'Literature',      title: 'Animal Farm — themes and irony' },
  { id: 'hum-43', unit: 'Literature',      title: 'Animal Farm — character growth (Boxer, Napoleon, Squealer)' },
  { id: 'hum-44', unit: 'Literature',      title: 'Book Club Books — themes and POV' },
  { id: 'hum-45', unit: 'Vocabulary',      title: '80 exam vocabulary words (use Vocab tab)' },
  // Section B — Reading Comprehension
  { id: 'hum-46', unit: 'Reading',         title: 'Annotation strategies' },
  { id: 'hum-47', unit: 'Reading',         title: 'Identifying main idea and evidence' },
  { id: 'hum-48', unit: 'Reading',         title: 'Making inferences and drawing conclusions' },
  { id: 'hum-49', unit: 'Reading',         title: 'Spotting poetic devices in unseen passages' },
  { id: 'hum-50', unit: 'Reading',         title: 'Multiple choice — eliminate clearly wrong choices' },
  // Section C — Written Response
  { id: 'hum-51', unit: 'Writing',         title: 'Topic sentence — clear and specific' },
  { id: 'hum-52', unit: 'Writing',         title: 'Body — evidence and explanation' },
  { id: 'hum-53', unit: 'Writing',         title: 'Conclusion — thought-provoking, not just repeat' },
  { id: 'hum-54', unit: 'Writing',         title: 'Sentence fluency — vary length and openers' },
  { id: 'hum-55', unit: 'Writing',         title: 'Powerful word choice (especially verbs)' },
  { id: 'hum-56', unit: 'Writing',         title: 'Transition words — see Transitions tab' },
  { id: 'hum-57', unit: 'Writing',         title: 'Voice — let your personality come through' },
  { id: 'hum-58', unit: 'Writing',         title: 'Modes — narrative, expository, persuasive, descriptive' },
  { id: 'hum-59', unit: 'Writing',         title: 'Proofread before handing in' },
  { id: 'hum-60', unit: 'Exam Strategy',   title: 'Skim entire exam, budget ~1/3 time per section' },
];

// ============================================================
// HUMANITIES — bring it all together
// ============================================================
const HUMANITIES_FLASHCARDS = [
  ...HUMANITIES_CONCEPT_CARDS,
  ...HUMANITIES_POETIC_CARDS,
  ...HUMANITIES_TRANSITION_CARDS.map(c => ({ front: 'Transitions: ' + c.front, back: c.back })),
  ...HUMANITIES_VOCAB.map(v => ({ front: v.word, back: v.definition })),
];

// Quiz: concept cards + poetic device cards + vocab MC + fill-in-the-blanks transformed to MC
const HUMANITIES_QUIZ = [
  ...cardQuiz(HUMANITIES_CONCEPT_CARDS, 'concept'),
  ...cardQuiz(HUMANITIES_POETIC_CARDS, 'poetic device'),
  ...HUMANITIES_VOCAB.map((v, i) => ({
    q: `What does "${v.word}" mean?`,
    choices: [
      v.definition,
      HUMANITIES_VOCAB[(i + 11) % HUMANITIES_VOCAB.length].definition,
      HUMANITIES_VOCAB[(i + 23) % HUMANITIES_VOCAB.length].definition,
      HUMANITIES_VOCAB[(i + 41) % HUMANITIES_VOCAB.length].definition,
    ],
    answer: 0,
  })),
  ...HUMANITIES_FILL.map((f, i) => ({
    q: f.q,
    choices: [
      f.answer,
      HUMANITIES_FILL[(i + 7) % HUMANITIES_FILL.length].answer,
      HUMANITIES_FILL[(i + 19) % HUMANITIES_FILL.length].answer,
      HUMANITIES_FILL[(i + 37) % HUMANITIES_FILL.length].answer,
    ],
    answer: 0,
  })),
];

// ============================================================
// FRENCH TOPICS — full breakdown by exam section
// ============================================================
const FRENCH_TOPICS = [
  { id: 'fr-1',  unit: 'Section 1 — Grammar', title: 'Identify subject, verb, adjective, noun, pronoun' },
  { id: 'fr-2',  unit: 'Section 1 — Grammar', title: 'Define grammar terms (subject, adjective, etc.)' },
  { id: 'fr-3',  unit: 'Section 2 — Present ER', title: 'ER endings: -e -es -e -ons -ez -ent' },
  { id: 'fr-4',  unit: 'Section 2 — Present ER', title: 'Translate 18 ER verbs (chanter, danser, manger...)' },
  { id: 'fr-5',  unit: 'Section 2 — Present ER', title: 'Conjugate parler in all 6 forms' },
  { id: 'fr-6',  unit: 'Section 2 — Present ER', title: 'Compose ER sentences using all subject pronouns' },
  { id: 'fr-7',  unit: 'Section 2 — Present IR', title: 'IR endings: -is -is -it -issons -issez -issent' },
  { id: 'fr-8',  unit: 'Section 2 — Present IR', title: 'Translate 4 IR verbs (choisir, finir, grandir, réussir)' },
  { id: 'fr-9',  unit: 'Section 2 — Present IR', title: 'Conjugate finir in all 6 forms' },
  { id: 'fr-10', unit: 'Section 2 — Present RE', title: 'RE endings: -s -s [no ending] -ons -ez -ent' },
  { id: 'fr-11', unit: 'Section 2 — Present RE', title: 'Translate 6 RE verbs (vendre, attendre, perdre...)' },
  { id: 'fr-12', unit: 'Section 2 — Present RE', title: 'Conjugate vendre in all 6 forms' },
  { id: 'fr-13', unit: 'Section 3 — Irregular', title: 'ÊTRE = je suis, tu es, il est, nous sommes, vous êtes, ils sont' },
  { id: 'fr-14', unit: 'Section 3 — Irregular', title: 'AVOIR = j\'ai, tu as, il a, nous avons, vous avez, ils ont' },
  { id: 'fr-15', unit: 'Section 3 — Irregular', title: 'ALLER = je vais, tu vas, il va, nous allons, vous allez, ils vont' },
  { id: 'fr-16', unit: 'Section 3 — Irregular', title: 'FAIRE = je fais, tu fais, il fait, nous faisons, vous faites, ils font' },
  { id: 'fr-17', unit: 'Section 3 — Irregular', title: 'VOULOIR = je veux, tu veux, il veut, nous voulons, vous voulez, ils veulent' },
  { id: 'fr-18', unit: 'Section 3 — Irregular', title: 'PRENDRE = je prends, tu prends, il prend, nous prenons, vous prenez, ils prennent' },
  { id: 'fr-19', unit: 'Section 3 — Irregular', title: 'BOIRE = je bois, tu bois, il boit, nous buvons, vous buvez, ils boivent' },
  { id: 'fr-20', unit: 'Section 3 — Irregular', title: 'POUVOIR = je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent' },
  { id: 'fr-21', unit: 'Section 3 — Irregular', title: 'DEVOIR = je dois, tu dois, il doit, nous devons, vous devez, ils doivent' },
  { id: 'fr-22', unit: 'Section 4 — Futur Proche', title: 'Formula: aller (conjugated) + infinitive' },
  { id: 'fr-23', unit: 'Section 4 — Futur Proche', title: 'Translate English → futur proche' },
  { id: 'fr-24', unit: 'Section 4 — Futur Proche', title: 'Convert present → futur proche' },
  { id: 'fr-25', unit: 'Section 4 — Futur Proche', title: 'Convert passé composé → futur proche' },
  { id: 'fr-26', unit: 'Section 5 — Passé Composé AVOIR', title: 'Formula: subject + avoir + past participle' },
  { id: 'fr-27', unit: 'Section 5 — Passé Composé AVOIR', title: 'ER → é (mangé, parlé, dansé, joué)' },
  { id: 'fr-28', unit: 'Section 5 — Passé Composé AVOIR', title: 'IR → i (fini, choisi, grandi, réussi)' },
  { id: 'fr-29', unit: 'Section 5 — Passé Composé AVOIR', title: 'RE → u (vendu, attendu, perdu, entendu)' },
  { id: 'fr-30', unit: 'Section 5 — Passé Composé AVOIR', title: 'Irregular: été, eu, fait, mis, vu, voulu, pris, bu, pu, dû' },
  { id: 'fr-31', unit: 'Section 6 — Passé Composé ÊTRE', title: 'Formula: subject + être + past participle (with agreement)' },
  { id: 'fr-32', unit: 'Section 6 — Passé Composé ÊTRE', title: 'The 5 verbs tested: aller, arriver, rentrer, rester, venir' },
  { id: 'fr-33', unit: 'Section 6 — Passé Composé ÊTRE', title: 'Agreement: +e feminine, +s plural, +es feminine plural' },
  { id: 'fr-34', unit: 'Section 6 — Passé Composé ÊTRE', title: 'Past participles: allé, arrivé, rentré, resté, venu' },
  { id: 'fr-35', unit: 'Section 7 — Negatives', title: 'Present tense: ne + verb + pas' },
  { id: 'fr-36', unit: 'Section 7 — Negatives', title: 'Passé composé: ne + auxiliary + pas + participle' },
  { id: 'fr-37', unit: 'Section 7 — Negatives', title: 'Futur proche: ne + aller + pas + infinitive' },
  { id: 'fr-38', unit: 'Section 7 — Negatives', title: 'n\' before vowel (n\'aime, n\'a, n\'est)' },
  { id: 'fr-39', unit: 'Section 8 — Adjectives', title: 'Agreement in gender (M/F) and number (sing/pl)' },
  { id: 'fr-40', unit: 'Section 8 — Adjectives', title: '+e for feminine, +s for plural, +es for feminine plural' },
  { id: 'fr-41', unit: 'Section 8 — Adjectives', title: 'Special endings: -eux → -euse, -if → -ive' },
  { id: 'fr-42', unit: 'Section 8 — Adjectives', title: 'Irregular: blanc → blanche, gentil → gentille' },
  { id: 'fr-43', unit: 'Section 9 — Q&A', title: 'Answer with full sentences using subject pronouns' },
  { id: 'fr-44', unit: 'Section 9 — Q&A', title: 'Practice 6 personal questions (weekend, family, hobbies)' },
  { id: 'fr-45', unit: 'Section 10 — Translations', title: 'English → French sentence translations' },
  { id: 'fr-46', unit: 'Section 10 — Translations', title: 'Convert futur proche ↔ passé composé' },
  { id: 'fr-47', unit: 'Accents', title: 'Type accents (é, è, ê, à, ô, ç, ï)' },
];

// ============================================================
// FRENCH FLASHCARDS — built from all the content
// ============================================================
const FRENCH_GRAMMAR_CARDS = [
  { front: 'Subject', back: 'The person, place, or thing performing the action of the verb. Ex: Le chat est petit. (Le chat = subject)' },
  { front: 'Verb', back: 'The action word or state of being. Ex: Le chat EST petit.' },
  { front: 'Adjective', back: 'A word that describes a noun. Agrees in gender and number. Ex: petit (m), petite (f).' },
  { front: 'Noun', back: 'A person, place, thing, or idea. Has gender (m/f) in French.' },
  { front: 'Pronoun', back: 'Replaces a noun. Ex: je, tu, il, elle, nous, vous, ils, elles.' },
  { front: 'ER endings', back: '-e (je), -es (tu), -e (il/elle/on), -ons (nous), -ez (vous), -ent (ils/elles)' },
  { front: 'IR endings', back: '-is (je), -is (tu), -it (il/elle/on), -issons (nous), -issez (vous), -issent (ils/elles)' },
  { front: 'RE endings', back: '-s (je), -s (tu), nothing (il/elle/on), -ons (nous), -ez (vous), -ent (ils/elles)' },
  { front: 'Futur proche formula', back: 'aller (conjugated) + infinitive. Ex: Je vais manger.' },
  { front: 'Passé composé avec AVOIR', back: 'subject + avoir (conjugated) + past participle. Ex: J\'ai mangé.' },
  { front: 'Passé composé avec ÊTRE', back: 'subject + être (conjugated) + past participle (WITH agreement). Ex: Elle est allée.' },
  { front: '5 ÊTRE verbs (exam)', back: 'aller (allé), arriver (arrivé), rentrer (rentré), rester (resté), venir (venu)' },
  { front: 'ER past participle', back: 'Drop -er, add -é. Ex: parler → parlé.' },
  { front: 'IR past participle', back: 'Drop -ir, add -i. Ex: finir → fini.' },
  { front: 'RE past participle', back: 'Drop -re, add -u. Ex: vendre → vendu.' },
  { front: 'Irregular past participles', back: 'être→été, avoir→eu, faire→fait, mettre→mis, voir→vu, vouloir→voulu, prendre→pris, boire→bu, pouvoir→pu, devoir→dû' },
  { front: 'ÊTRE agreement', back: 'Feminine: +e (allée). Plural: +s (allés). Feminine plural: +es (allées).' },
  { front: 'Negation present', back: 'ne + verb + pas. Ex: Je ne joue pas.' },
  { front: 'Negation passé composé', back: 'ne + auxiliary + pas + past participle. Ex: Je n\'ai pas mangé.' },
  { front: 'Negation futur proche', back: 'ne + aller (conj) + pas + infinitive. Ex: Je ne vais pas jouer.' },
  { front: 'Adjective agreement', back: '+e (feminine), +s (plural), +es (feminine plural). Some are irregular!' },
  { front: 'Subject pronouns', back: 'je (I), tu (you sing), il/elle/on (he/she/one), nous (we), vous (you pl/formal), ils/elles (they)' },
];

const FRENCH_FLASHCARDS = [
  ...FRENCH_GRAMMAR_CARDS,
  ...FRENCH_ER_VERBS.map(v => ({ front: 'ER verb: ' + v.word, back: v.definition })),
  ...FRENCH_IR_VERBS.map(v => ({ front: 'IR verb: ' + v.word, back: v.definition })),
  ...FRENCH_RE_VERBS.map(v => ({ front: 'RE verb: ' + v.word, back: v.definition })),
  ...FRENCH_PARTICIPLE_DRILLS.slice(0, 15).map(d => ({ front: 'Past participle of ' + d.prompt, back: d.answer })),
];

// FRENCH QUIZ — built from all drills, transformed to MC
const FRENCH_QUIZ = [
  ...cardQuiz(FRENCH_GRAMMAR_CARDS, 'French grammar'),
  // Verb translations
  ...FRENCH_ER_VERBS.map((v, i) => ({
    q: `What does "${v.word}" mean?`,
    choices: [
      v.definition,
      FRENCH_ER_VERBS[(i + 5) % FRENCH_ER_VERBS.length].definition,
      FRENCH_IR_VERBS[i % FRENCH_IR_VERBS.length].definition,
      FRENCH_RE_VERBS[i % FRENCH_RE_VERBS.length].definition,
    ],
    answer: 0,
  })),
  // Conjugation drills as MC
  ...FRENCH_CONJUGATION_DRILLS_FULL.map((d, i) => ({
    q: `Conjugate: ${d.prompt}`,
    choices: [
      d.answer,
      FRENCH_CONJUGATION_DRILLS_FULL[(i + 7) % FRENCH_CONJUGATION_DRILLS_FULL.length].answer,
      FRENCH_CONJUGATION_DRILLS_FULL[(i + 13) % FRENCH_CONJUGATION_DRILLS_FULL.length].answer,
      FRENCH_CONJUGATION_DRILLS_FULL[(i + 23) % FRENCH_CONJUGATION_DRILLS_FULL.length].answer,
    ],
    answer: 0,
  })),
  // Past participles
  ...FRENCH_PARTICIPLE_DRILLS.slice(0, 15).map((d, i) => ({
    q: `Past participle of "${d.prompt}"?`,
    choices: [
      d.answer,
      FRENCH_PARTICIPLE_DRILLS[(i + 3) % FRENCH_PARTICIPLE_DRILLS.length].answer,
      FRENCH_PARTICIPLE_DRILLS[(i + 7) % FRENCH_PARTICIPLE_DRILLS.length].answer,
      FRENCH_PARTICIPLE_DRILLS[(i + 11) % FRENCH_PARTICIPLE_DRILLS.length].answer,
    ],
    answer: 0,
  })),
];

// FRENCH_CONJUGATION_DRILLS becomes alias to the full version
const FRENCH_CONJUGATION_DRILLS = FRENCH_CONJUGATION_DRILLS_FULL;

// Accent-typing drills — common words with accents
const FRENCH_ACCENT_DRILLS = [
  { prompt: 'Type "été" (summer)', answer: 'été' },
  { prompt: 'Type "école" (school)', answer: 'école' },
  { prompt: 'Type "passé composé"', answer: 'passé composé' },
  { prompt: 'Type "très" (very)', answer: 'très' },
  { prompt: 'Type "déjà" (already)', answer: 'déjà' },
  { prompt: 'Type "français" (French)', answer: 'français' },
  { prompt: 'Type "où" (where)', answer: 'où' },
  { prompt: 'Type "à" (at/to)', answer: 'à' },
  { prompt: 'Type "ça" (it/that)', answer: 'ça' },
  { prompt: 'Type "préféré" (favorite)', answer: 'préféré' },
];



const MATH_MORE_FLASHCARDS = toCards('Order of operations|Use brackets exponents division multiplication addition subtraction.;Coefficient|The number multiplying a variable.;Constant term|A number without a variable.;Expression|A math phrase without an equals sign.;Equation|A statement that two expressions are equal.;Inequality|A comparison using less than or greater than signs.;Substitution|Replace a variable with a given value.;First differences|Differences between consecutive y-values in a table.;Nonlinear relation|A relation without constant first differences.;x-axis|Horizontal axis.;y-axis|Vertical axis.;Origin|The point (0,0).;Quadrant|One of four regions on the coordinate plane.;Net|A 2D pattern that folds into a 3D object.;Radius|Distance from centre of circle to edge.;Diameter|Distance across a circle through the centre.;Pi|Ratio of circumference to diameter.;Prism|A solid with two congruent parallel bases.;Cylinder|A solid with two circular bases.;Theoretical probability|Expected probability based on all possible outcomes.');
const MATH_MORE_QUIZ = cardQuiz(MATH_MORE_FLASHCARDS, 'math term');
const ALL_SCIENCE_TOPICS = [...SCIENCE_TOPICS, ...SCIENCE_EXTRA_TOPICS];
const ALL_SCIENCE_QUIZ = [...SCIENCE_QUIZ, ...SCIENCE_EXTRA_QUIZ];
const ALL_SCIENCE_FLASHCARDS = [...SCIENCE_FLASHCARDS, ...SCIENCE_EXTRA_FLASHCARDS];
const ALL_MATH_TOPICS = [...MATH_TOPICS, ...MATH_EXTRA_TOPICS];
const ALL_MATH_QUIZ = [...MATH_QUIZ, ...MATH_EXTRA_QUIZ, ...MATH_MORE_QUIZ];
const ALL_MATH_FLASHCARDS = [...MATH_FLASHCARDS, ...MATH_EXTRA_FLASHCARDS, ...MATH_MORE_FLASHCARDS];
const SUBJECT_TOPIC_COUNTS = { science: ALL_SCIENCE_TOPICS.length, math: ALL_MATH_TOPICS.length, humanities: HUMANITIES_TOPICS.length, french: FRENCH_TOPICS.length };
// ============================================================
// HELPER COMPONENTS
// ============================================================
function useCountdown(targetDate) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        total: diff,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function StudyPlatform() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);  const [view, setView] = useState('home'); // home | subject | settings | admin | leaderboard | profile
  const [activeSubject, setActiveSubject] = useState(null);  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [examDates, setExamDates] = useState(DEFAULT_EXAM_DATES);
  const [progress, setProgress] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [musicLibrary, setMusicLibrary] = useState([]);
  const [bgChoice, setBgChoice] = useState('rainy-window');
  const [ambience, setAmbience] = useState({ rain: 0, wind: 0, fire: 0 });
  const [masterSound, setMasterSound] = useState(true);
  const [quote, setQuote] = useState('');  const [showCountdownIntro, setShowCountdownIntro] = useState(true);

  // Load on init
  useEffect(() => {
    (async () => {
      const p = await storage.get('profile_local');      const ed = await storage.get('exam_dates', true);
      const ml = await storage.get('music_library', true);
      const bg = await storage.get('bg_choice_local');
      const amb = await storage.get('ambience_local');
      if (p) setProfile(p);      if (ed) setExamDates(ed);
      if (ml) setMusicLibrary(ml);
      if (bg) setBgChoice(bg);
      if (amb) setAmbience(amb);

      // load progress
      if (p) {
        const prog = await storage.get(`progress_${p.username}`);
        if (prog) setProgress(prog);
      }

      // load all users for leaderboard
      const userKeys = await storage.list('user_', true);
      const users = [];
      for (const k of userKeys) {
        const u = await storage.get(k, true);
        if (u) users.push(u);
      }
      setAllUsers(users);

      setLoading(false);
    })();
  }, []);

  // Rotate calm quotes
  useEffect(() => {
    setQuote(NORMAL_QUOTES[Math.floor(Math.random() * NORMAL_QUOTES.length)]);
    const id = setInterval(() => {
      setQuote(NORMAL_QUOTES[Math.floor(Math.random() * NORMAL_QUOTES.length)]);
    }, 12000);
    return () => clearInterval(id);
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (profile && Object.keys(progress).length > 0) {
      storage.set(`progress_${profile.username}`, progress);
      // Also update the shared user record
      const userRec = {
        username: profile.username,
        realName: profile.realName,
        picture: profile.picture,
        progress,
        lastActive: Date.now(),
        readiness: calcReadiness(progress),
        streak: profile.streak || 0,
      };
      storage.set(`user_${profile.username}`, userRec, true);
    }
  }, [progress, profile]);

  function calcReadiness(prog) {
    const subjects = ['science', 'math', 'humanities', 'french'];
    let total = 0, count = 0;
    subjects.forEach(s => {
      const subj = prog[s] || {};
      const topicsTotal = SUBJECT_TOPIC_COUNTS[s] || 1;
      const topicsDone = Object.values(subj.topics || {}).filter(Boolean).length;
      const topicPct = (topicsDone / topicsTotal) * 100;
      const quizAvg = subj.quizScores && subj.quizScores.length ? (subj.quizScores.reduce((a,b)=>a+b,0) / subj.quizScores.length) * 100 : 0;
      total += (topicPct * 0.6 + quizAvg * 0.4);
      count++;
    });
    return Math.round(total / count);
  }

  const handleProfileCreate = async (newProfile) => {
    setProfile(newProfile);
    await storage.set('profile_local', newProfile);
    // also save to shared
    const userRec = {
      username: newProfile.username,
      realName: newProfile.realName,
      picture: newProfile.picture,
      progress: {},
      lastActive: Date.now(),
      readiness: 0,
      streak: 0,
    };
    await storage.set(`user_${newProfile.username}`, userRec, true);
    setShowCountdownIntro(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="text-2xl font-light tracking-widest mb-2">LOADING</div>
          <div className="w-32 h-0.5 bg-white/20 mx-auto overflow-hidden">
            <div className="h-full bg-white animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <WelcomeScreen onCreate={handleProfileCreate} />;
  }


  return (
    <div className="study-app">
      <BackgroundLayer bg={bgChoice} />
      <AmbienceLayer ambience={ambience} masterSound={masterSound} />

      {showCountdownIntro && view === 'home' && (
        <CountdownIntro examDates={examDates} masterSound={masterSound} onDone={() => setShowCountdownIntro(false)} />
      )}

      {showAdminPrompt && (
        <AdminPasswordPrompt
          onClose={() => setShowAdminPrompt(false)}
          onSuccess={() => { setAdminUnlocked(true); setShowAdminPrompt(false); setView('admin'); }}
        />
      )}

      {view === 'home' && (
        <HomeView
          profile={profile}
          quote={quote}
          examDates={examDates}
          progress={progress}
          allUsers={allUsers}
          onSubject={(s) => { setActiveSubject(s); setView('subject'); }}
          onSettings={() => setView('settings')}
          onAdmin={() => adminUnlocked ? setView('admin') : setShowAdminPrompt(true)}
          onProfile={() => setView('profile')}
          onLeaderboard={() => setView('leaderboard')}
        />
      )}

      {view === 'subject' && activeSubject && (
        <SubjectView
          subject={activeSubject}
          profile={profile}
          examDate={examDates[activeSubject]}
          progress={progress[activeSubject] || {}}
          updateProgress={(updater) => {
            setProgress(prev => ({ ...prev, [activeSubject]: updater(prev[activeSubject] || {}) }));
          }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'settings' && (
        <SettingsView
          bgChoice={bgChoice}
          setBgChoice={(b) => { setBgChoice(b); storage.set('bg_choice_local', b); }}
          ambience={ambience}
          setAmbience={(a) => { setAmbience(a); storage.set('ambience_local', a); }}
          masterSound={masterSound}
          setMasterSound={setMasterSound}
          onBack={() => setView('home')}
        />
      )}

      {view === 'admin' && adminUnlocked && (
        <AdminPanel
          examDates={examDates}
          setExamDates={async (d) => { setExamDates(d); await storage.set('exam_dates', d, true); }}
          musicLibrary={musicLibrary}
          setMusicLibrary={async (m) => { setMusicLibrary(m); await storage.set('music_library', m, true); }}
          onBack={() => setView('home')}
        />
      )}

      {view === 'leaderboard' && (
        <LeaderboardView
          allUsers={allUsers}
          currentUser={profile}
          onBack={() => setView('home')}
        />
      )}

      {view === 'profile' && (
        <ProfileView
          profile={profile}
          progress={progress}
          updateProfile={async (np) => { setProfile(np); await storage.set('profile_local', np); }}
          onBack={() => setView('home')}
          onLogout={async () => {
            await storage.delete('profile_local');
            window.location.reload();
          }}
        />
      )}

      <MusicBar musicLibrary={musicLibrary} masterSound={masterSound} />

      <div className="fixed bottom-2 right-3 text-[10px] text-white/30 italic pointer-events-none select-none z-10" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
        made by leonard braunstein
      </div>

      <style>{`
        .study-app {
          min-height: 100vh;
          width: 100%;
          position: relative;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: white;
          overflow-x: hidden;
        }
        .study-app {
          --accent: #a3d4ff;
          --accent2: #c8b6ff;
          --bg-overlay: rgba(15, 23, 42, 0.55);
          --card-bg: rgba(255, 255, 255, 0.08);
          --card-border: rgba(255, 255, 255, 0.15);
        }
        .glass {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .pulse-soft { animation: pulseSoft 3s ease-in-out infinite; }
        @keyframes pulseSoft { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .glow-soft { text-shadow: 0 0 8px rgba(163, 212, 255, 0.6); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        button { transition: all 0.2s ease; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}


// ============================================================
// WELCOME SCREEN
// ============================================================
function WelcomeScreen({ onCreate }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [realName, setRealName] = useState('');
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState('');

  const handlePictureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Picture too large. Please use an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPicture(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    setError('');
    if (step === 1) {
      if (!username.trim()) { setError('Username required'); return; }
      if (username.length < 2) { setError('Username too short'); return; }
      // Check duplicate
      const existing = await storage.get(`user_${username.toLowerCase()}`, true);
      if (existing) { setError('Username already taken. Try another.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!realName.trim()) { setError('Real name required'); return; }
      setStep(3);
    } else {
      onCreate({
        username: username.toLowerCase(),
        displayUsername: username,
        realName,
        picture: picture || null,
        joinedAt: Date.now(),
        streak: 0,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0c1426 0%, #1a1f3a 50%, #0c1426 100%)'
    }}>
      {/* atmospheric dots */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(163, 212, 255, 0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(200, 182, 255, 0.15), transparent 40%)'
      }} />

      <div className="relative z-10 max-w-md w-full fade-in">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.3em] text-blue-200/60 mb-3">GRADE 8 DOMINATION</div>
          <h1 className="text-5xl font-light text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Enter the Study Space</h1>
          <div className="text-blue-200/50 text-sm">Your exam prep, refined.</div>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(n => (
              <div key={n} className={`h-1 w-12 rounded-full transition-all ${n <= step ? 'bg-blue-300' : 'bg-white/15'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-blue-100/80 mb-2 block">Choose a username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. leonardb"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-300 transition"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                <div className="text-xs text-white/40 mt-1">Must be unique. Visible on the leaderboard.</div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-blue-100/80 mb-2 block">What's your real name?</span>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-300 transition"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                <div className="text-xs text-white/40 mt-1">Just for your profile. Friends will see this.</div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <span className="text-sm text-blue-100/80 mb-2 block text-center">Pick a profile picture</span>
              <div className="flex flex-col items-center">
                <label className="cursor-pointer group">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center overflow-hidden group-hover:border-blue-300 transition">
                    {picture ? (
                      <img src={picture} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-white/40 mb-1" />
                        <div className="text-xs text-white/40">Click to upload</div>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" />
                </label>
                {picture && (
                  <button onClick={() => setPicture(null)} className="text-xs text-white/50 mt-2 hover:text-white/80">Remove</button>
                )}
                <div className="text-xs text-white/40 mt-3 text-center">Optional. You can skip this and add one later.</div>
              </div>
            </div>
          )}

          {error && <div className="text-red-300 text-sm mt-4 text-center">{error}</div>}

          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 border border-white/10">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-300 hover:to-purple-300 text-slate-900 font-medium"
            >
              {step === 3 ? 'Enter Study Space' : 'Continue'}
              <ChevronRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-xs text-white/30">
          made by leonard braunstein
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BACKGROUND LAYER
// ============================================================
function BackgroundLayer({ bg }) {
  const backgrounds = {
    'rainy-window': 'linear-gradient(135deg, #1a2540 0%, #2c3e6e 50%, #1a2540 100%)',
    'dark-forest': 'linear-gradient(180deg, #0a1410 0%, #1a2818 50%, #0a1410 100%)',
    'sunset-sky': 'linear-gradient(180deg, #2a1a3a 0%, #6e3b5f 40%, #c97a5a 80%, #f0b878 100%)',
    'night-city': 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2a 60%, #2a1a4a 100%)',
    'minimal-dark': 'linear-gradient(135deg, #0c0c10 0%, #16161e 100%)',
  };

  return (
    <div className="fixed inset-0 -z-10 transition-all duration-1000" style={{
      background: backgrounds[bg] || backgrounds['rainy-window']
    }}>
      {bg === 'rainy-window' && <RainEffect />}
      {bg === 'dark-forest' && <RainEffect intensity={0.4} />}
      {bg === 'night-city' && <CityLights />}
      {bg === 'sunset-sky' && (
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 70% 80%, rgba(255, 200, 100, 0.3), transparent 60%)'
        }} />
      )}
      <div className="absolute inset-0" style={{ background: 'var(--bg-overlay)' }} />
    </div>
  );
}

function RainEffect({ intensity = 0.6 }) {
  const drops = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: intensity }}>
      {drops.map((_, i) => {
        const left = Math.random() * 100;
        const duration = 0.5 + Math.random() * 0.8;
        const delay = Math.random() * 2;
        return (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-200/40 to-transparent"
            style={{
              left: `${left}%`,
              top: '-10%',
              height: `${20 + Math.random() * 30}px`,
              animation: `rain ${duration}s linear ${delay}s infinite`
            }}
          />
        );
      })}
      <style>{`
        @keyframes rain {
          to { transform: translateY(110vh); }
        }
      `}</style>
    </div>
  );
}

function CityLights() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${50 + Math.random() * 50}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            background: ['#ff6b6b', '#ffd93d', '#a3d4ff', '#ffffff'][Math.floor(Math.random()*4)],
            opacity: 0.6 + Math.random() * 0.4,
            boxShadow: '0 0 4px currentColor',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// AMBIENCE LAYER (uses Web Audio API for synthesized sounds)
// ============================================================
function AmbienceLayer({ ambience, masterSound }) {
  const audioCtxRef = useRef(null);
  const nodesRef = useRef({ rain: null, wind: null, fire: null });

  useEffect(() => {
    if (!masterSound) {
      // Stop all
      Object.keys(nodesRef.current).forEach(k => {
        if (nodesRef.current[k]) {
          try { nodesRef.current[k].stop(); } catch(e){}
          nodesRef.current[k] = null;
        }
      });
      return;
    }

    const initAudio = async () => {
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          return;
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Helper to create looped noise
      const createNoise = (filterFreq, q, gain) => {
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;
        filter.Q.value = q;
        const gainNode = ctx.createGain();
        gainNode.gain.value = gain;
        source.connect(filter).connect(gainNode).connect(ctx.destination);
        source.start();
        return { source, gainNode };
      };

      // Manage each sound
      const sounds = [
        { name: 'rain', filter: 4000, q: 1, baseGain: 0.15 },
        { name: 'wind', filter: 800, q: 2, baseGain: 0.2 },
        { name: 'fire', filter: 1500, q: 1, baseGain: 0.18 },
      ];

      sounds.forEach(s => {
        const vol = ambience[s.name] / 100;
        if (vol > 0 && !nodesRef.current[s.name]) {
          nodesRef.current[s.name] = createNoise(s.filter, s.q, s.baseGain * vol);
        } else if (vol === 0 && nodesRef.current[s.name]) {
          try { nodesRef.current[s.name].source.stop(); } catch(e){}
          nodesRef.current[s.name] = null;
        } else if (nodesRef.current[s.name]) {
          nodesRef.current[s.name].gainNode.gain.setTargetAtTime(s.baseGain * vol, ctx.currentTime, 0.1);
        }
      });
    };

    initAudio();

    return () => {
      // cleanup handled above
    };
  }, [ambience, masterSound]);

  return null;
}

// ============================================================
// ADMIN PASSWORD PROMPT
// ============================================================
function AdminPasswordPrompt({ onClose, onSuccess }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (pwd === 'Santafox@ha11') {
      onSuccess();
    } else {
      setError('Incorrect password');
      setPwd('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <Lock className="w-8 h-8 mb-4 text-amber-300" />
        <h2 className="text-xl font-light mb-2">Admin Access</h2>
        <p className="text-white/50 text-sm mb-4">Enter the password to continue.</p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-300"
        />
        {error && <div className="text-red-300 text-sm mt-2">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancel</button>
          <button onClick={submit} className="flex-1 px-4 py-2 rounded-lg bg-amber-400 text-black font-medium hover:bg-amber-300">Unlock</button>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// HOME VIEW
// ============================================================
function HomeView({ profile, quote, examDates, progress, allUsers, onSubject, onSettings, onAdmin, onProfile, onLeaderboard }) {
  const subjects = [
    { key: 'science', name: 'Science', icon: BookOpen, color: 'from-blue-500 to-emerald-400', accent: '#10b981', topics: ALL_SCIENCE_TOPICS.length },
    { key: 'math', name: 'Math', icon: Calculator, color: 'from-sky-400 to-blue-500', accent: '#3b82f6', topics: ALL_MATH_TOPICS.length },
    { key: 'humanities', name: 'Humanities', icon: Globe, color: 'from-amber-600 to-orange-500', accent: '#d97706', topics: HUMANITIES_TOPICS.length },
    { key: 'french', name: 'French', icon: Languages, color: 'from-blue-700 to-red-500', accent: '#dc2626', topics: FRENCH_TOPICS.length },
  ];
  const topUsers = [...allUsers].sort((a, b) => (b.readiness || 0) - (a.readiness || 0)).slice(0, 3);
  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in">
      <header className="flex items-center justify-between mb-8">
        <div><div className="text-xs tracking-[0.3em] text-white/40 mb-1">STUDY SPACE</div><h1 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Georgia, serif' }}>Welcome back, {profile.realName.split(' ')[0]}</h1></div>
        <div className="flex items-center gap-2">
          <button onClick={onLeaderboard} className="p-2 rounded-lg hover:bg-white/10" title="Leaderboard"><Trophy className="w-5 h-5" /></button>
          <button onClick={onSettings} className="p-2 rounded-lg hover:bg-white/10" title="Settings"><Settings className="w-5 h-5" /></button>
          <button onClick={onAdmin} className="p-2 rounded-lg hover:bg-white/10 opacity-40 hover:opacity-100" title="Admin"><Lock className="w-4 h-4" /></button>
          <button onClick={onProfile} className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50">{profile.picture ? <img src={profile.picture} alt="profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm font-bold">{profile.realName[0]?.toUpperCase()}</div>}</button>
        </div>
      </header>
      <div className="mb-8 fade-in"><div className="glass rounded-2xl p-5"><div className="text-xs uppercase tracking-widest text-white/40 mb-1">Today's reminder</div><div className="text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>"{quote}"</div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">{subjects.map(s => <SubjectCard key={s.key} subject={s} examDate={examDates[s.key]} progress={progress[s.key] || {}} onClick={() => onSubject(s.key)} />)}</div>
      {topUsers.length > 0 && <div className="glass rounded-2xl p-5 mb-8"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-medium flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-300" /> Top Students</h3><button onClick={onLeaderboard} className="text-xs text-white/60 hover:text-white">See all -</button></div><div className="space-y-2">{topUsers.map((u, i) => <div key={u.username} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-300 text-amber-900' : i === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-amber-100'}`}>{i + 1}</div><div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">{u.picture ? <img src={u.picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">{u.realName[0]?.toUpperCase()}</div>}</div><div className="flex-1"><div className="text-sm font-medium">{u.realName}</div><div className="text-xs text-white/40">@{u.username}</div></div><div className="text-right"><div className="text-sm font-bold">{u.readiness || 0}%</div><div className="text-xs text-white/40">readiness</div></div></div>)}</div></div>}
      <div style={{ height: '100px' }} />
    </div>
  );
}

function SubjectCard({ subject, examDate, progress, onClick }) {
  const time = useCountdown(examDate);
  const Icon = subject.icon;
  const topicsDone = Object.values(progress.topics || {}).filter(Boolean).length;
  const totalTopics = subject.topics;
  const pct = totalTopics > 0 ? Math.round((topicsDone / totalTopics) * 100) : 0;
  return <button onClick={onClick} className="group relative overflow-hidden rounded-2xl p-6 text-left border transition-all duration-500 border-white/10 hover:border-white/30 glass" style={{ minHeight: '180px' }}><div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition bg-gradient-to-br ${subject.color}`} /><div className="relative z-10"><div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg" style={{ background: `${subject.accent}30`, border: `1px solid ${subject.accent}50` }}><Icon className="w-5 h-5" style={{ color: subject.accent }} /></div><div className="text-xl font-medium">{subject.name}</div></div><ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition" /></div>{time.total > 0 ? <div className="flex gap-3 mb-3"><CountUnit value={time.days} label="days" /><CountUnit value={time.hours} label="hrs" /><CountUnit value={time.minutes} label="min" /><CountUnit value={time.seconds} label="sec" /></div> : <div className="text-sm text-white/50 mb-3">Exam date passed or not set.</div>}{totalTopics > 0 ? <><div className="flex justify-between text-xs text-white/60 mb-1"><span>{topicsDone} / {totalTopics} topics</span><span>{pct}%</span></div><div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: subject.accent }} /></div></> : <div className="text-xs text-white/40 italic">Content coming soon.</div>}{time.total > 0 && time.days < 8 && time.days >= 3 && <div className="mt-3 text-xs text-amber-200 italic pulse-soft">Final week. Stay focused.</div>}{time.total > 0 && time.days < 3 && <div className="mt-3 text-xs text-amber-300 italic pulse-soft">Almost there. You got this.</div>}</div></button>;
}

function CountUnit({ value, label }) {
  return <div className="text-center"><div className="text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div><div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div></div>;
}

// ============================================================
// SUBJECT VIEW
// ============================================================
function SubjectView({ subject, profile, examDate, progress, updateProgress, onBack }) {
  const [tab, setTab] = useState('topics');
  const time = useCountdown(examDate);

  const themes = {
    science: { primary: '#10b981', secondary: '#1e3a8a', name: 'Science', icon: BookOpen },
    math: { primary: '#3b82f6', secondary: '#dbeafe', name: 'Math', icon: Calculator },
    humanities: { primary: '#d97706', secondary: '#fef3c7', name: 'Humanities', icon: Globe },
    french: { primary: '#dc2626', secondary: '#1e3a8a', name: 'French', icon: Languages },
  };
  const theme = themes[subject];
  const Icon = theme.icon;

  const subjectData = {
    science: { topics: ALL_SCIENCE_TOPICS, quiz: ALL_SCIENCE_QUIZ, flashcards: ALL_SCIENCE_FLASHCARDS },
    math: { topics: ALL_MATH_TOPICS, quiz: ALL_MATH_QUIZ, flashcards: ALL_MATH_FLASHCARDS },
    humanities: { topics: HUMANITIES_TOPICS, quiz: HUMANITIES_QUIZ, flashcards: HUMANITIES_FLASHCARDS },
    french: { topics: FRENCH_TOPICS, quiz: FRENCH_QUIZ, flashcards: FRENCH_FLASHCARDS },
  }[subject];

  const tabs = [
    { id: 'topics', label: 'Topics', icon: Check },
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: Target },
    { id: 'mock', label: 'Mock Exam', icon: Award },
    ...(subject === 'math' ? [{ id: 'formulas', label: 'Formulas', icon: Calculator }, { id: 'generator', label: 'Problem Gen', icon: Zap }] : []),
    ...(subject === 'science' ? [{ id: 'diagram', label: 'Diagrams', icon: Eye }] : []),
    ...(subject === 'humanities' ? [
      { id: 'vocab', label: 'Vocab Quiz', icon: BookOpen },
      { id: 'fillblanks', label: 'Fill-in Blanks', icon: Edit3 },
      { id: 'paragraph', label: 'Paragraph + AI', icon: FileText },
    ] : []),
    ...(subject === 'french' ? [
      { id: 'conjugate', label: 'Conjugate', icon: Edit3 },
      { id: 'pastense', label: 'Passé Composé', icon: Edit3 },
      { id: 'futur', label: 'Futur Proche', icon: Edit3 },
      { id: 'negative', label: 'Negatives', icon: Edit3 },
      { id: 'translate', label: 'Translate', icon: Languages },
      { id: 'accents', label: 'Accents', icon: Edit3 },
    ] : []),
    { id: 'videos', label: 'Videos', icon: Youtube },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in">
      {/* Subject header */}
      <header className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white">
          <ChevronLeft className="w-5 h-5" /> <span>Home</span>
        </button>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6" style={{ color: theme.primary }} />
          <div className="text-2xl font-medium">{theme.name}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Exam in</div>
          <div className="text-lg font-bold tabular-nums" style={{ color: theme.primary }}>{time.days}d {String(time.hours).padStart(2,'0')}h</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        {tabs.map(t => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition border ${
                tab === t.id
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <TabIcon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'topics' && <TopicsList subject={subject} topics={subjectData.topics} progress={progress} updateProgress={updateProgress} theme={theme} />}
      {tab === 'flashcards' && <FlashcardsView cards={subjectData.flashcards} theme={theme} subject={subject} />}
      {tab === 'quiz' && <QuizView questions={subjectData.quiz} updateProgress={updateProgress} progress={progress} theme={theme} subject={subject} />}
      {tab === 'mock' && <MockExamView questions={subjectData.quiz} updateProgress={updateProgress} progress={progress} theme={theme} subject={subject} />}
      {tab === 'formulas' && subject === 'math' && <FormulasView formulas={MATH_FORMULAS} />}
      {tab === 'generator' && subject === 'math' && <ProblemGenerator />}
      {tab === 'diagram' && subject === 'science' && <DiagramLabel />}
      {tab === 'vocab' && subject === 'humanities' && <VocabQuizView vocab={HUMANITIES_VOCAB} progress={progress} updateProgress={updateProgress} theme={theme} />}
      {tab === 'fillblanks' && subject === 'humanities' && <FillBlanksView items={HUMANITIES_FILL} progress={progress} updateProgress={updateProgress} theme={theme} />}
      {tab === 'paragraph' && subject === 'humanities' && <ParagraphPracticeView vocab={HUMANITIES_VOCAB} />}
      {tab === 'conjugate' && subject === 'french' && <FrenchDrillView drills={FRENCH_CONJUGATION_DRILLS_FULL} title="Conjugation Drills" subtitle="All ER, IR, RE, and irregular verbs from your package." theme={theme} />}
      {tab === 'pastense' && subject === 'french' && <FrenchDrillView drills={FRENCH_PC_DRILLS} title="Passé Composé Drills" subtitle="Both AVOIR and ÊTRE helpers — regular and irregular verbs." theme={theme} />}
      {tab === 'futur' && subject === 'french' && <FrenchDrillView drills={FRENCH_FP_DRILLS} title="Futur Proche Drills" subtitle="English → French and present/passé composé → futur proche." theme={theme} />}
      {tab === 'negative' && subject === 'french' && <FrenchDrillView drills={FRENCH_NEGATIVE_DRILLS} title="Negative Drills" subtitle="Convert positive sentences to negative form." theme={theme} />}
      {tab === 'translate' && subject === 'french' && <FrenchDrillView drills={FRENCH_TRANSLATION_DRILLS} title="Translation Drills" subtitle="English → French and futur proche ↔ passé composé." theme={theme} />}
      {tab === 'accents' && subject === 'french' && <FrenchDrillView drills={FRENCH_ACCENT_DRILLS} title="Accent Typing" subtitle="Practice typing French words with accents (é, è, ê, à, ô, ç)." theme={theme} />}
      {tab === 'videos' && <VideosView subject={subject} />}
      {tab === 'notes' && <NotesView subject={subject} username={profile.username} />}

      <div style={{ height: '100px' }} />
    </div>
  );
}

// ============================================================
// TOPICS LIST
// ============================================================
function TopicsList({ subject, topics, progress, updateProgress, theme }) {
  if (topics.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-white/60 italic">
          Topics for this subject haven't been added yet.<br/>
          The admin can add them via the Admin Panel â†’ Topics editor.
        </div>
      </div>
    );
  }

  const toggle = (tid) => {
    updateProgress(p => ({
      ...p,
      topics: { ...(p.topics || {}), [tid]: !(p.topics?.[tid]) }
    }));
  };

  // Group by unit
  const grouped = {};
  topics.forEach(t => {
    if (!grouped[t.unit]) grouped[t.unit] = [];
    grouped[t.unit].push(t);
  });

  const completedCount = Object.values(progress.topics || {}).filter(Boolean).length;
  const pct = Math.round((completedCount / topics.length) * 100);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-white/60">Overall progress</div>
            <div className="text-2xl font-bold">{completedCount} / {topics.length} topics</div>
          </div>
          <div className="text-3xl font-bold" style={{ color: theme.primary }}>{pct}%</div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: theme.primary }} />
        </div>
      </div>

      {Object.entries(grouped).map(([unit, items]) => {
        const unitDone = items.filter(t => progress.topics?.[t.id]).length;
        return (
          <div key={unit} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: theme.primary }}>{unit}</h3>
              <div className="text-sm text-white/60">{unitDone} / {items.length}</div>
            </div>
            <div className="space-y-1">
              {items.map(t => {
                const done = progress.topics?.[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition text-left ${
                      done ? 'bg-white/5' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                      done ? 'border-transparent' : 'border-white/30'
                    }`} style={{ background: done ? theme.primary : 'transparent' }}>
                      {done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`flex-1 text-sm ${done ? 'line-through text-white/40' : ''}`}>
                      {t.title}
                    </div>
                    {!done && <div className="text-xs text-white/30 italic">Not studied yet</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// FLASHCARDS VIEW
// ============================================================
function FlashcardsView({ cards, theme, subject }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());

  if (cards.length === 0) {
    return <div className="glass rounded-2xl p-12 text-center text-white/60 italic">Flashcards coming soon for this subject.</div>;
  }

  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx((idx + 1) % cards.length); };
  const prev = () => { setFlipped(false); setIdx((idx - 1 + cards.length) % cards.length); };

  const markKnown = () => {
    const newSet = new Set(knownCards);
    newSet.add(idx);
    setKnownCards(newSet);
    setTimeout(next, 200);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-white/60">
        <div>Card {idx + 1} of {cards.length}</div>
        <div>{knownCards.size} marked known</div>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="glass rounded-2xl p-12 cursor-pointer min-h-[280px] flex flex-col justify-center text-center hover:bg-white/10 transition select-none"
        style={{ border: `1px solid ${theme.primary}40` }}
      >
        <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
          {flipped ? 'Answer' : 'Question'} â€” tap to flip
        </div>
        <div className={`${flipped ? 'text-lg' : 'text-2xl font-light'}`} style={{ fontFamily: flipped ? 'inherit' : 'Georgia, serif' }}>
          {flipped ? card.back : card.front}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={prev} className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={markKnown}
          className="flex-1 py-3 rounded-lg font-medium"
          style={{ background: theme.primary, color: 'white' }}
        >
          âœ“ I know this
        </button>
        <button onClick={next} className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// QUIZ VIEW
// ============================================================
function QuizView({ questions, updateProgress, progress, theme, subject }) {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffled, setShuffled] = useState(() => [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length)));

  if (questions.length === 0) {
    return <div className="glass rounded-2xl p-12 text-center text-white/60 italic">Quiz questions coming soon for this subject.</div>;
  }

  const submit = () => {
    setSubmitted(true);
    let correct = 0;
    shuffled.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    const score = correct / shuffled.length;
    updateProgress(p => ({
      ...p,
      quizScores: [...(p.quizScores || []), score],
      totalQuizzes: (p.totalQuizzes || 0) + 1,
    }));
  };

  const reset = () => {
    setShuffled([...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length)));
    setSelected({});
    setSubmitted(false);
  };

  let score = 0;
  if (submitted) {
    shuffled.forEach((q, i) => { if (selected[i] === q.answer) score++; });
  }

  const allAnswered = shuffled.every((_, i) => selected[i] !== undefined);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">Quick Quiz</div>
          <div className="text-lg">{shuffled.length} random questions</div>
          {progress.quizScores?.length > 0 && (
            <div className="text-xs text-white/40 mt-1">
              Average: {Math.round((progress.quizScores.reduce((a,b)=>a+b,0) / progress.quizScores.length) * 100)}% over {progress.quizScores.length} attempts
            </div>
          )}
        </div>
        <button onClick={reset} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-2 text-sm">
          <RotateCcw className="w-4 h-4" /> New set
        </button>
      </div>

      {submitted && (
        <div className="glass rounded-2xl p-6 text-center" style={{ borderColor: theme.primary }}>
          <div className="text-4xl font-bold mb-2" style={{ color: theme.primary }}>
            {score} / {shuffled.length}
          </div>
          <div className="text-white/70">{Math.round((score / shuffled.length) * 100)}% correct</div>
          {score === shuffled.length && <div className="text-amber-300 mt-2">ðŸ† Perfect score!</div>}
          {score / shuffled.length >= 0.9 && score < shuffled.length && <div className="text-emerald-300 mt-2">Excellent work.</div>}
          {score / shuffled.length < 0.6 && <div className="text-amber-300 mt-2">Review the topics and try again.</div>}
        </div>
      )}

      <div className="space-y-4">
        {shuffled.map((q, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="text-xs text-white/40 mb-1">Question {i + 1}</div>
            <div className="text-base mb-4 font-medium">{q.q}</div>
            <div className="space-y-2">
              {q.choices.map((c, ci) => {
                const isSelected = selected[i] === ci;
                const isCorrect = ci === q.answer;
                let className = 'w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ';
                if (submitted) {
                  if (isCorrect) className += 'border-emerald-400 bg-emerald-400/10';
                  else if (isSelected && !isCorrect) className += 'border-red-400 bg-red-400/10';
                  else className += 'border-white/10';
                } else {
                  className += isSelected ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/30';
                }
                return (
                  <button
                    key={ci}
                    disabled={submitted}
                    onClick={() => !submitted && setSelected({ ...selected, [i]: ci })}
                    className={className}
                  >
                    <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'border-white bg-white text-black' : 'border-white/30'
                    }`}>{String.fromCharCode(97 + ci)}</div>
                    <div className="flex-1">{c}</div>
                    {submitted && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                    {submitted && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="w-full py-4 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: theme.primary, color: 'white' }}
        >
          {allAnswered ? 'Submit Quiz' : `Answer all ${shuffled.length} questions to submit`}
        </button>
      )}
    </div>
  );
}


// ============================================================
// MOCK EXAM (longer, timed)
// ============================================================
function MockExamView({ questions, updateProgress, progress, theme, subject }) {
  const [started, setStarted] = useState(false);
  const [examQs, setExamQs] = useState([]);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(60); // minutes

  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [started, submitted, timeLeft]);

  if (questions.length === 0) {
    return <div className="glass rounded-2xl p-12 text-center text-white/60 italic">Mock exam coming soon for this subject.</div>;
  }

  const start = () => {
    setExamQs([...questions].sort(() => Math.random() - 0.5));
    setSelected({});
    setSubmitted(false);
    setTimeLeft(duration * 60);
    setStarted(true);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    examQs.forEach((q, i) => { if (selected[i] === q.answer) correct++; });
    const score = correct / examQs.length;
    updateProgress(p => ({
      ...p,
      mockExamScores: [...(p.mockExamScores || []), score],
    }));
  };

  if (!started) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <Award className="w-12 h-12 mx-auto mb-4" style={{ color: theme.primary }} />
        <h3 className="text-2xl font-light mb-2" style={{ fontFamily: 'Georgia, serif' }}>Mock Exam</h3>
        <p className="text-white/60 mb-6">Simulates the real exam experience with timed conditions.</p>
        <div className="flex justify-center gap-2 mb-6">
          {[30, 60, 90, 120].map(d => (
            <button key={d} onClick={() => setDuration(d)} className={`px-3 py-2 rounded-lg ${duration === d ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
              {d} min
            </button>
          ))}
        </div>
        {progress.mockExamScores?.length > 0 && (
          <div className="text-sm text-white/60 mb-4">
            Best: {Math.round(Math.max(...progress.mockExamScores) * 100)}% â€¢ Attempts: {progress.mockExamScores.length}
          </div>
        )}
        <button onClick={start} className="px-8 py-4 rounded-xl font-medium" style={{ background: theme.primary, color: 'white' }}>
          Begin Exam
        </button>
      </div>
    );
  }

  let score = 0;
  if (submitted) examQs.forEach((q, i) => { if (selected[i] === q.answer) score++; });

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const lowTime = timeLeft < 300;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-4 sticky top-2 z-20 flex items-center justify-between" style={{ borderColor: lowTime && !submitted ? '#ef4444' : '' }}>
        <div className="text-sm">
          <div className="text-white/60">Mock Exam</div>
          <div className="font-medium">{Object.keys(selected).length} / {examQs.length} answered</div>
        </div>
        <div className="text-right">
          {!submitted ? (
            <>
              <div className="text-xs text-white/60">Time left</div>
              <div className={`text-2xl font-bold tabular-nums ${lowTime ? 'text-red-400' : ''}`}>
                {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-white/60">Final score</div>
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {score} / {examQs.length} ({Math.round((score/examQs.length)*100)}%)
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {examQs.map((q, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="text-xs text-white/40 mb-1">Question {i + 1} of {examQs.length}</div>
            <div className="text-base mb-4 font-medium">{q.q}</div>
            <div className="space-y-2">
              {q.choices.map((c, ci) => {
                const isSelected = selected[i] === ci;
                const isCorrect = ci === q.answer;
                let className = 'w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ';
                if (submitted) {
                  if (isCorrect) className += 'border-emerald-400 bg-emerald-400/10';
                  else if (isSelected && !isCorrect) className += 'border-red-400 bg-red-400/10';
                  else className += 'border-white/10';
                } else {
                  className += isSelected ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/30';
                }
                return (
                  <button
                    key={ci}
                    disabled={submitted}
                    onClick={() => !submitted && setSelected({ ...selected, [i]: ci })}
                    className={className}
                  >
                    <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'border-white bg-white text-black' : 'border-white/30'
                    }`}>{String.fromCharCode(97 + ci)}</div>
                    <div className="flex-1">{c}</div>
                    {submitted && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                    {submitted && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button onClick={handleSubmit} className="w-full py-4 rounded-xl font-medium" style={{ background: theme.primary, color: 'white' }}>
          Submit Mock Exam
        </button>
      ) : (
        <button onClick={() => setStarted(false)} className="w-full py-4 rounded-xl font-medium bg-white/10 hover:bg-white/15">
          Back to Mock Exam Setup
        </button>
      )}
    </div>
  );
}

// ============================================================
// VOCAB, WRITING, FRENCH DRILLS, COUNTDOWN INTRO
// ============================================================
function VocabQuizView({ vocab, progress, updateProgress, theme }) {
  const [mode, setMode] = useState('definition');
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [shuffled, setShuffled] = useState(() => [...vocab].sort(() => Math.random() - 0.5));

  const item = shuffled[index % shuffled.length];
  const stats = progress.vocabStats || {};

  // Build 3 distractor choices + the correct one
  const choices = (() => {
    const others = vocab.filter(v => v.word !== item.word);
    const distractors = [];
    const seen = new Set();
    let i = (index * 7) % others.length;
    while (distractors.length < 3 && distractors.length < others.length) {
      const cand = others[i % others.length];
      if (!seen.has(cand.word)) { distractors.push(cand); seen.add(cand.word); }
      i++;
    }
    return [...distractors, item].sort(() => 0.5 - ((item.word.charCodeAt(0) + index) % 2));
  })();

  const normalize = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

  const mark = (correct) => {
    updateProgress(p => {
      const cur = p.vocabStats?.[item.word] || { correct: 0, wrong: 0 };
      return {
        ...p,
        vocabStats: {
          ...(p.vocabStats || {}),
          [item.word]: {
            correct: cur.correct + (correct ? 1 : 0),
            wrong: cur.wrong + (correct ? 0 : 1),
            lastTried: Date.now()
          }
        }
      };
    });
    setFeedback(correct ? '✓ Correct.' : `✗ Not quite. ${item.word}: ${item.definition}`);
  };

  const submit = () => {
    if (mode === 'definition') {
      const answer = normalize(typed);
      // Check if their answer contains key words from the definition
      const keyWords = normalize(item.definition).split(' ').filter(w => w.length > 3);
      const matches = keyWords.filter(w => answer.includes(w)).length;
      // Need at least 1 substantive keyword to count
      mark(matches >= 1 && answer.length > 5);
    } else {
      mark(selected?.word === item.word);
    }
  };

  const next = () => {
    setIndex(i => (i + 1) % shuffled.length);
    setTyped('');
    setSelected(null);
    setFeedback(null);
  };

  const learned = Object.values(stats).filter(s => (s.correct || 0) > (s.wrong || 0)).length;
  const struggling = Object.entries(stats).filter(([_, s]) => (s.wrong || 0) > (s.correct || 0)).map(([w]) => w);

  const reshuffle = () => {
    setShuffled([...vocab].sort(() => Math.random() - 0.5));
    setIndex(0);
    setTyped('');
    setSelected(null);
    setFeedback(null);
  };

  const focusStruggling = () => {
    if (struggling.length === 0) return;
    const tough = vocab.filter(v => struggling.includes(v.word));
    setShuffled([...tough, ...vocab.filter(v => !struggling.includes(v.word))].slice(0, vocab.length));
    setIndex(0);
    setTyped('');
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setMode('definition')} className={`px-3 py-2 rounded-lg text-sm ${mode === 'definition' ? 'bg-white/15 border border-white/30' : 'bg-white/5 border border-white/10'}`}>Type Definition</button>
          <button onClick={() => setMode('multiple')} className={`px-3 py-2 rounded-lg text-sm ${mode === 'multiple' ? 'bg-white/15 border border-white/30' : 'bg-white/5 border border-white/10'}`}>Multiple Choice</button>
          <button onClick={reshuffle} className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 ml-auto"><Shuffle className="w-3 h-3 inline mr-1" />Shuffle</button>
          {struggling.length > 0 && <button onClick={focusStruggling} className="px-3 py-2 rounded-lg text-sm bg-amber-500/20 border border-amber-300/30 hover:bg-amber-500/30">Focus weak ({struggling.length})</button>}
        </div>
        <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Word {index + 1} / {shuffled.length}</div>
        <div className="text-4xl font-light mb-6" style={{ color: theme.primary, fontFamily: 'Georgia, serif' }}>{item.word}</div>

        {mode === 'definition' ? (
          <textarea
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
            placeholder="Type the definition in your own words... (Ctrl+Enter to check)"
            className="w-full min-h-[130px] bg-white/10 border border-white/20 rounded-xl p-4 outline-none focus:border-white/40 text-white"
          />
        ) : (
          <div className="grid gap-2">
            {choices.map(c => (
              <button
                key={c.word}
                onClick={() => setSelected(c)}
                className={`p-3 rounded-xl text-left border ${selected?.word === c.word ? 'border-white/40 bg-white/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              >
                {c.definition}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${feedback.startsWith('✓') ? 'bg-emerald-500/15 border border-emerald-300/30' : 'bg-red-500/15 border border-red-300/30'}`}>
            {feedback}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium">Check</button>
          <button onClick={next} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Next →</button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-medium mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-300" /> Vocab Tracker</h3>
        <div className="text-3xl font-bold mb-1" style={{ color: theme.primary }}>{learned}/{vocab.length}</div>
        <div className="text-xs text-white/50 mb-4">words trending correct</div>

        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">All words (✓/✗)</div>
        <div className="max-h-[420px] overflow-auto space-y-1 text-xs pr-1">
          {vocab.map(v => {
            const s = stats[v.word] || { correct: 0, wrong: 0 };
            const status = (s.correct || 0) > (s.wrong || 0) ? 'good' : (s.wrong || 0) > 0 ? 'bad' : 'untried';
            return (
              <div key={v.word} className={`flex justify-between border-b border-white/5 py-1 ${status === 'good' ? 'text-emerald-300' : status === 'bad' ? 'text-red-300' : 'text-white/60'}`}>
                <span className="truncate">{v.word}</span>
                <span className="tabular-nums">{s.correct || 0}/{s.wrong || 0}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FILL-IN-THE-BLANKS VIEW (humanities)
// ============================================================
function FillBlanksView({ items, progress, updateProgress, theme }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [shuffled, setShuffled] = useState(() => [...items].sort(() => Math.random() - 0.5));

  const item = shuffled[index % shuffled.length];
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '').trim();

  const check = () => {
    const correct = norm(answer) === norm(item.answer);
    setFeedback(correct ? '✓ Correct!' : `✗ Answer: ${item.answer}`);
    updateProgress(p => {
      const cur = p.fillBlanksStats || { correct: 0, wrong: 0 };
      return { ...p, fillBlanksStats: { correct: cur.correct + (correct ? 1 : 0), wrong: cur.wrong + (correct ? 0 : 1) } };
    });
  };

  const next = () => {
    setIndex(i => (i + 1) % shuffled.length);
    setAnswer('');
    setFeedback(null);
  };

  const reshuffle = () => {
    setShuffled([...items].sort(() => Math.random() - 0.5));
    setIndex(0);
    setAnswer('');
    setFeedback(null);
  };

  const stats = progress.fillBlanksStats || { correct: 0, wrong: 0 };
  const total = stats.correct + stats.wrong;
  const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Fill in the Blank</h3>
        <div className="text-xs text-white/50">{stats.correct}/{total} correct ({pct}%)</div>
      </div>

      <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Question {index + 1} / {shuffled.length}</div>
      <div className="text-xl mb-5 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
        {item.q.split('___').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && <span className="inline-block px-3 py-1 mx-1 bg-white/10 rounded border-b-2" style={{ borderColor: theme.primary, minWidth: '120px' }}>____</span>}
          </span>
        ))}
      </div>

      <input
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (feedback ? next() : check())}
        placeholder="Type the missing word..."
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 outline-none focus:border-white/40 text-lg text-white"
        autoFocus
      />

      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${feedback.startsWith('✓') ? 'bg-emerald-500/15 border border-emerald-300/30' : 'bg-red-500/15 border border-red-300/30'}`}>
          {feedback}
        </div>
      )}

      <div className="flex gap-2 mt-5">
        <button onClick={check} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-medium">Check</button>
        <button onClick={next} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Next →</button>
        <button onClick={reshuffle} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 ml-auto"><Shuffle className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ============================================================
// PARAGRAPH PRACTICE — with real AI feedback
// ============================================================
function ParagraphPracticeView({ vocab }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const used = vocab.filter(v => new RegExp('\\b' + v.word + '\\b', 'i').test(text)).map(v => v.word);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const localRubric = () => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const score = Math.min(10, Math.max(3,
      3
      + Math.min(3, used.length)
      + (wordCount > 100 ? 2 : wordCount > 50 ? 1 : 0)
      + (sentences.length >= 4 ? 1 : 0)
      + (/[.!?]\s+[A-Z]/.test(text) ? 1 : 0)
    ));
    return `**Local Rubric Estimate: ${score}/10**

**Vocabulary (out of 4):**
${used.length === 0 ? '✗ No target vocab used yet. Aim for 4-6.' : `✓ Used ${used.length} target word${used.length === 1 ? '' : 's'}: ${used.join(', ')}.`}

**Structure (out of 3):**
${sentences.length} sentence${sentences.length === 1 ? '' : 's'} detected. ${sentences.length >= 4 ? '✓ Good length.' : 'Aim for at least 4-5 full sentences.'}

**Grammar/Conventions (out of 3):**
${/[.!?]\s+[A-Z]/.test(text) ? '✓ Sentence boundaries look good.' : 'Check capitalization and end punctuation.'}

**Tips:**
- Strong topic sentence first
- Use varied sentence openers (not all "I" or "The")
- End with a thought-provoking conclusion (not a simple repeat)
- Proofread for missing words or wrong tense

(Note: This is a backup local check — for real AI feedback, the artifact needs API access.)`;
  };

  const getFeedback = async () => {
    setLoading(true);
    setError('');
    setFeedback('');

    const prompt = `You are a Grade 8 Humanities teacher. Grade this paragraph out of 10 and give brief specific feedback in this exact format:

**Grade: X/10**

**Vocabulary use:** [1-2 sentences about which target vocab words were used and how well]

**Structure:** [1-2 sentences on topic sentence, supporting details, and conclusion]

**Grammar & conventions:** [1-2 sentences on punctuation, capitalization, sentence variety]

**Ideas & voice:** [1-2 sentences on creativity and clarity]

**One thing to fix first:** [the single most impactful improvement]

Target vocabulary the student is practicing: ${vocab.slice(0, 80).map(v => v.word).join(', ')}
Words they actually used: ${used.length ? used.join(', ') : 'none'}

Their paragraph:
"""
${text}
"""`;

    // Try window.claude.complete first (artifact-native API)
    try {
      if (window.claude && typeof window.claude.complete === 'function') {
        const result = await window.claude.complete(prompt);
        setFeedback(result);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.log('window.claude.complete failed, trying fetch...', e);
    }

    // Fall back to direct API call
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!response.ok) throw new Error('API responded ' + response.status);
      const data = await response.json();
      const text = data.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
      setFeedback(text || 'No feedback returned. Try again.');
    } catch (e) {
      console.error('API call failed:', e);
      setError('AI service unavailable — showing local rubric instead.');
      setFeedback(localRubric());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-medium">Paragraph / Story Practice</h3>
        <div className="flex gap-3 text-xs text-white/60">
          <span>Words: <strong className="text-white">{wordCount}</strong></span>
          <span>Vocab used: <strong className="text-white">{used.length}</strong></span>
        </div>
      </div>

      <div className="text-xs text-white/50 mb-3">
        Write 8-12 sentences using as many of the 80 target vocab words as you can. Then get AI feedback on grammar, vocabulary, structure, and ideas.
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your paragraph or short story here. Try to weave in target vocab naturally..."
        className="w-full min-h-[280px] bg-white/10 border border-white/20 rounded-xl p-4 outline-none focus:border-white/40 text-white leading-relaxed"
      />

      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          disabled={!text.trim() || loading || wordCount < 20}
          onClick={getFeedback}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white font-medium"
        >
          {loading ? 'Reading...' : 'Get AI Feedback'}
        </button>
        <button onClick={() => { setText(''); setFeedback(''); setError(''); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Clear</button>
        {wordCount < 20 && <div className="text-xs text-white/50 self-center">Write at least 20 words to enable feedback.</div>}
      </div>

      {used.length > 0 && (
        <div className="mt-4 text-xs text-white/70">
          <span className="text-white/50">Vocab used: </span>
          {used.map(w => <span key={w} className="inline-block px-2 py-0.5 rounded bg-amber-300/20 text-amber-200 mr-1 mb-1">{w}</span>)}
        </div>
      )}

      {error && <div className="mt-4 text-xs text-amber-300">{error}</div>}

      {feedback && (
        <div className="mt-4 bg-black/25 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-light">
          {feedback}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FRENCH DRILL VIEW — flexible drill component
// ============================================================
function FrenchDrillView({ drills, title, subtitle, theme }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [shuffled, setShuffled] = useState(() => [...drills].sort(() => Math.random() - 0.5));

  // Reset when drill set changes
  useEffect(() => {
    setShuffled([...drills].sort(() => Math.random() - 0.5));
    setIdx(0);
    setAnswer('');
    setResult('');
    setStats({ correct: 0, wrong: 0 });
  }, [drills]);

  const item = shuffled[idx % shuffled.length];

  // Strip accents and normalize for forgiving comparison
  const norm = s => (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[(),.?!\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Strict version that keeps accents (for accent practice)
  const normStrict = s => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  const check = () => {
    if (result) return; // already checked
    const isAccent = title.includes('Accent');
    const correct = isAccent
      ? normStrict(answer) === normStrict(item.answer)
      : norm(answer) === norm(item.answer);
    setResult(correct ? '✓ Correct!' : `✗ Answer: ${item.answer}`);
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
  };

  const next = () => {
    setIdx(i => (i + 1) % shuffled.length);
    setAnswer('');
    setResult('');
  };

  const reshuffle = () => {
    setShuffled([...drills].sort(() => Math.random() - 0.5));
    setIdx(0);
    setAnswer('');
    setResult('');
  };

  const insertAccent = (char) => {
    setAnswer(a => a + char);
  };

  const total = stats.correct + stats.wrong;
  const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="text-xs text-white/60">Session: <strong className="text-white">{stats.correct}/{total}</strong> ({pct}%)</div>
      </div>
      <div className="text-xs text-white/50 mb-5">{subtitle}</div>

      <div className="text-xs uppercase tracking-widest text-white/40 mb-2">Item {idx + 1} / {shuffled.length}</div>
      <div className="text-xl md:text-2xl mb-5 leading-relaxed" style={{ color: theme.primary, fontFamily: 'Georgia, serif' }}>{item.prompt}</div>

      <input
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (result ? next() : check())}
        placeholder="Tape ta réponse..."
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 outline-none focus:border-white/40 text-lg text-white"
        autoFocus
      />

      {/* Accent quick buttons */}
      <div className="flex flex-wrap gap-1 mt-2">
        {['é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ö', 'ù', 'û', 'ç'].map(c => (
          <button
            key={c}
            onClick={() => insertAccent(c)}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm font-mono"
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      {result && (
        <div className={`mt-4 p-3 rounded-lg ${result.startsWith('✓') ? 'bg-emerald-500/15 border border-emerald-300/30' : 'bg-red-500/15 border border-red-300/30'}`}>
          {result}
        </div>
      )}

      <div className="flex gap-2 mt-5">
        <button onClick={check} disabled={!!result} className="px-4 py-2 rounded-lg disabled:opacity-50" style={{ background: theme.primary, color: 'white' }}>Check</button>
        <button onClick={next} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Next →</button>
        <button onClick={reshuffle} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 ml-auto" title="Shuffle"><Shuffle className="w-4 h-4" /></button>
      </div>

      <div className="text-xs text-white/40 mt-4 italic">
        💡 Tip: Accents are forgiving for most drills (é matches e). For accent typing, exact accents required.
      </div>
    </div>
  );
}

// Backwards-compat alias (in case anything still references FrenchDrillsView)
function FrenchDrillsView(props) {
  return <FrenchDrillView drills={FRENCH_CONJUGATION_DRILLS_FULL} title="Conjugation Drills" subtitle="All ER, IR, RE and irregular verbs." {...props} />;
}

function CountdownIntro({ examDates, masterSound, onDone }) {
  const exams = Object.entries(examDates)
    .map(([subject, date]) => ({ subject, date: new Date(date) }))
    .filter(e => e.date.getTime() > Date.now())
    .sort((a, b) => a.date - b.date);
  const next = exams[0];
  const days = next ? Math.ceil((next.date.getTime() - Date.now()) / 86400000) : 0;

  // Tiers escalate as exam approaches
  const tier = days < 3 ? 'full'
    : days <= 7 ? 'explosive'
    : days <= 14 ? 'flames'
    : days <= 30 ? 'particles'
    : 'simple';

  const duration = tier === 'full' ? 7500
    : tier === 'explosive' ? 4500
    : tier === 'flames' ? 3300
    : tier === 'particles' ? 2600
    : 1800;

  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [duration, onDone]);

  // Multi-stage progression for "full" tier
  useEffect(() => {
    if (tier !== 'full') return;
    const t1 = setTimeout(() => setStage(1), 2200);
    const t2 = setTimeout(() => setStage(2), 4400);
    const t3 = setTimeout(() => setStage(3), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [tier]);

  // Synth music sting
  useEffect(() => {
    if (!masterSound || !['full', 'explosive', 'flames'].includes(tier)) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();

      // Sub bass hit
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(60, ctx.currentTime);
      bass.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.6);
      bassGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      bass.connect(bassGain).connect(ctx.destination);
      bass.start();
      bass.stop(ctx.currentTime + 1.6);

      // High shimmer for full tier
      if (tier === 'full') {
        setTimeout(() => {
          try {
            const high = ctx.createOscillator();
            const highGain = ctx.createGain();
            high.type = 'sine';
            high.frequency.setValueAtTime(880, ctx.currentTime);
            high.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 1.5);
            highGain.gain.setValueAtTime(0.0001, ctx.currentTime);
            highGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.3);
            highGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
            high.connect(highGain).connect(ctx.destination);
            high.start();
            high.stop(ctx.currentTime + 1.7);
          } catch (e) {}
        }, 4000);

        // Final boom
        setTimeout(() => {
          try {
            const boom = ctx.createOscillator();
            const boomGain = ctx.createGain();
            boom.type = 'sawtooth';
            boom.frequency.setValueAtTime(40, ctx.currentTime);
            boomGain.gain.setValueAtTime(0.0001, ctx.currentTime);
            boomGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
            boomGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
            boom.connect(boomGain).connect(ctx.destination);
            boom.start();
            boom.stop(ctx.currentTime + 1.0);
          } catch (e) {}
        }, 5800);
      }
    } catch (e) {}
  }, [masterSound, tier]);

  const subjectName = next
    ? next.subject.charAt(0).toUpperCase() + next.subject.slice(1)
    : 'Exams';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden countdown-intro ${tier}`}>
      <div className="absolute inset-0" style={{ background: tier === 'full' || tier === 'explosive' ? 'radial-gradient(ellipse at center, rgba(80,20,20,0.95), rgba(2,4,12,0.98))' : 'rgba(2,6,20,0.95)' }} />

      {/* Particles for all non-simple tiers */}
      {tier !== 'simple' && Array.from({ length: tier === 'full' ? 100 : tier === 'explosive' ? 60 : 35 }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.8}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Flames for tier 7-14 days and below */}
      {['flames','explosive','full'].includes(tier) && <div className="absolute inset-x-0 bottom-0 flame-field" />}

      {/* Blast rings for explosive and full */}
      {['explosive','full'].includes(tier) && (
        <>
          <div className="absolute inset-0 flex items-center justify-center"><div className="blast-ring" /></div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="blast-ring delay-2" /></div>
        </>
      )}

      <button onClick={onDone} className="absolute top-5 right-5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/25 text-sm z-50 border border-white/20">
        Skip →
      </button>

      <div className="relative z-10 text-center px-6 trailer-copy">
        {tier === 'full' ? (
          <>
            {stage === 0 && (
              <div className="cinematic-stage">
                <div className="text-xs tracking-[0.6em] text-red-300/80 mb-6">THE FINAL COUNTDOWN</div>
                <div className="trailer-line">ALL YOUR WORK</div>
                <div className="trailer-line">IS UP FOR THIS</div>
              </div>
            )}
            {stage === 1 && (
              <div className="cinematic-stage">
                <div className="text-xs tracking-[0.6em] text-amber-300/80 mb-4">{subjectName.toUpperCase()} — IT'S ALMOST HERE</div>
                <div className="trailer-days">{days}</div>
                <div className="text-3xl md:text-5xl font-light tracking-widest text-amber-200" style={{ fontFamily: 'Georgia, serif' }}>
                  {days === 1 ? 'DAY REMAINS' : days === 0 ? 'TODAY' : 'DAYS REMAIN'}
                </div>
              </div>
            )}
            {stage === 2 && (
              <div className="cinematic-stage">
                <div className="trailer-line text-amber-300">ARE YOU READY?</div>
              </div>
            )}
            {stage === 3 && (
              <div className="cinematic-stage">
                <div className="text-xs tracking-[0.6em] text-emerald-300/80 mb-4">YOU'VE PUT IN THE WORK</div>
                <div className="trailer-line text-emerald-300">GO GET IT.</div>
              </div>
            )}
          </>
        ) : tier === 'explosive' ? (
          <>
            <div className="text-xs tracking-[0.5em] text-red-300/80 mb-4">{subjectName.toUpperCase()} — INTENSIFYING</div>
            <div className="text-8xl md:text-9xl font-black tabular-nums mb-3" style={{ color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,0.6)' }}>{days}</div>
            <div className="text-2xl md:text-3xl font-light text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>days until exam</div>
            <div className="text-sm text-amber-200/70 mt-4 italic">Lock in. The window is closing.</div>
          </>
        ) : tier === 'flames' ? (
          <>
            <div className="text-xs tracking-[0.4em] text-orange-300/80 mb-4">{subjectName.toUpperCase()} APPROACHES</div>
            <div className="text-8xl md:text-9xl font-bold tabular-nums mb-3" style={{ color: '#fb923c' }}>{days}</div>
            <div className="text-2xl md:text-3xl font-light" style={{ fontFamily: 'Georgia, serif' }}>days to go</div>
          </>
        ) : tier === 'particles' ? (
          <>
            <div className="text-xs tracking-[0.4em] text-blue-200/70 mb-4">{subjectName.toUpperCase()} EXAM</div>
            <div className="text-7xl md:text-8xl font-bold tabular-nums mb-3 text-blue-100">{days}</div>
            <div className="text-xl md:text-2xl font-light text-blue-200/80" style={{ fontFamily: 'Georgia, serif' }}>days remain</div>
          </>
        ) : (
          <>
            <div className="text-xs tracking-[0.4em] text-blue-200/70 mb-3">NEXT EXAM: {subjectName.toUpperCase()}</div>
            <div className="text-6xl font-light tabular-nums mb-2 text-white/90">{days}</div>
            <div className="text-lg font-light text-white/60" style={{ fontFamily: 'Georgia, serif' }}>days from now</div>
          </>
        )}
      </div>

      <style>{`
        .countdown-intro.explosive { animation: screenShake .28s ease-in-out 7; }
        .countdown-intro.full { animation: screenShake .35s ease-in-out 12; }
        .particle {
          position: absolute; bottom: -20px;
          width: 3px; height: 3px; border-radius: 999px;
          background: rgba(251, 191, 36, 0.7);
          animation: particleRise linear infinite;
          box-shadow: 0 0 6px currentColor;
        }
        .countdown-intro.particles .particle { background: rgba(147, 197, 253, .75); }
        .flame-field {
          height: 45vh;
          background:
            radial-gradient(circle at 15% 100%, rgba(251,146,60,.7), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(239,68,68,.6), transparent 35%),
            radial-gradient(circle at 80% 100%, rgba(251,146,60,.7), transparent 30%);
          filter: blur(10px);
          animation: flameFlicker .15s infinite alternate;
        }
        .blast-ring {
          border: 3px solid rgba(251, 191, 36, 0.5);
          border-radius: 999px;
          width: 30vmin; height: 30vmin;
          animation: blast 1.6s ease-out infinite;
        }
        .blast-ring.delay-2 { animation-delay: 0.6s; border-color: rgba(239, 68, 68, 0.4); }
        .cinematic-stage { animation: stageReveal 0.7s ease-out forwards; }
        .trailer-copy { animation: introPop 1.4s ease forwards; }
        .trailer-line {
          font-size: clamp(1.8rem, 5.5vw, 5.2rem);
          font-weight: 900;
          letter-spacing: .06em;
          line-height: 1.1;
          text-shadow: 0 0 25px rgba(255,255,255,0.2);
        }
        .trailer-days {
          font-size: clamp(5rem, 18vw, 16rem);
          font-weight: 900;
          color: #fbbf24;
          text-shadow: 0 0 40px rgba(251,191,36,.7), 0 0 80px rgba(251,191,36,.3);
          line-height: 1;
          margin: .15em 0;
          font-variant-numeric: tabular-nums;
        }
        @keyframes introPop {
          from { opacity: 0; transform: scale(.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes stageReveal {
          from { opacity: 0; transform: scale(.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes particleRise {
          to { transform: translateY(-110vh); opacity: 0; }
        }
        @keyframes flameFlicker {
          from { opacity: .65; transform: scaleY(.96); }
          to { opacity: 1; transform: scaleY(1.05); }
        }
        @keyframes blast {
          from { transform: scale(.2); opacity: .8; }
          to { transform: scale(4); opacity: 0; }
        }
        @keyframes screenShake {
          0%,100% { transform: translate(0); }
          25% { transform: translate(5px, -4px); }
          50% { transform: translate(-4px, 5px); }
          75% { transform: translate(4px, 4px); }
        }
      `}</style>
    </div>
  );
}
// ============================================================
// MATH FORMULAS VIEW
// ============================================================
function FormulasView({ formulas }) {
  return (
    <div className="space-y-3">
      <div className="text-sm text-white/60 mb-2">All formulas you need for the Grade 8 Math exam. Tap to copy.</div>
      {formulas.map((f, i) => (
        <div key={i} className="glass rounded-xl p-4 hover:bg-white/10 cursor-pointer" onClick={() => navigator.clipboard?.writeText(f.formula)}>
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-medium">{f.name}</div>
            <div className="text-blue-300 font-mono text-sm">{f.formula}</div>
          </div>
          {f.note && <div className="text-xs text-white/50 mt-1">{f.note}</div>}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MATH PROBLEM GENERATOR
// ============================================================
function ProblemGenerator() {
  const [problem, setProblem] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const types = [
    () => {
      // Slope from two points
      const x1 = randInt(-9, 9), y1 = randInt(-9, 9);
      let x2 = randInt(-9, 9), y2 = randInt(-9, 9);
      while (x2 === x1) x2 = randInt(-9, 9);
      const slope = (y2 - y1) / (x2 - x1);
      return {
        type: 'Slope',
        question: `Find the slope of the line passing through (${x1}, ${y1}) and (${x2}, ${y2}).`,
        answer: slope,
        unit: '',
        solution: `Slope = (yâ‚‚ - yâ‚) / (xâ‚‚ - xâ‚) = (${y2} - (${y1})) / (${x2} - (${x1})) = ${y2 - y1} / ${x2 - x1} = ${Number(slope.toFixed(4))}`
      };
    },
    () => {
      // Pythagorean - find hypotenuse
      const a = randInt(3, 20), b = randInt(3, 20);
      const c = Math.sqrt(a*a + b*b);
      return {
        type: 'Pythagorean Theorem',
        question: `A right triangle has legs of ${a} cm and ${b} cm. Find the hypotenuse (round to 1 decimal).`,
        answer: Number(c.toFixed(1)),
        unit: 'cm',
        solution: `cÂ² = aÂ² + bÂ²\ncÂ² = ${a}Â² + ${b}Â² = ${a*a} + ${b*b} = ${a*a + b*b}\nc = âˆš${a*a + b*b} â‰ˆ ${c.toFixed(1)} cm`
      };
    },
    () => {
      // Pythagorean - find a leg
      const a = randInt(3, 15);
      const c = a + randInt(2, 10);
      const b = Math.sqrt(c*c - a*a);
      return {
        type: 'Pythagorean Theorem',
        question: `A right triangle has hypotenuse ${c} m and one leg ${a} m. Find the other leg (round to 1 decimal).`,
        answer: Number(b.toFixed(1)),
        unit: 'm',
        solution: `aÂ² + bÂ² = cÂ²\nbÂ² = cÂ² - aÂ² = ${c*c} - ${a*a} = ${c*c - a*a}\nb = âˆš${c*c - a*a} â‰ˆ ${b.toFixed(1)} m`
      };
    },
    () => {
      // Volume of cone
      const r = randInt(2, 10);
      const h = randInt(5, 20);
      const v = (1/3) * Math.PI * r * r * h;
      return {
        type: 'Volume of cone',
        question: `Find the volume of a cone with radius ${r} cm and height ${h} cm. (Use Ï€ â‰ˆ 3.14, round to 1 decimal)`,
        answer: Number(v.toFixed(1)),
        unit: 'cmÂ³',
        solution: `V = (1/3) Ã— Ï€ Ã— rÂ² Ã— h\nV = (1/3) Ã— 3.14 Ã— ${r}Â² Ã— ${h}\nV = (1/3) Ã— 3.14 Ã— ${r*r} Ã— ${h}\nV â‰ˆ ${v.toFixed(1)} cmÂ³`
      };
    },
    () => {
      // Volume of sphere
      const r = randInt(3, 12);
      const v = (4/3) * Math.PI * r * r * r;
      return {
        type: 'Volume of sphere',
        question: `Find the volume of a sphere with radius ${r} cm. (Use Ï€ â‰ˆ 3.14, round to whole number)`,
        answer: Math.round(v),
        unit: 'cmÂ³',
        solution: `V = (4/3) Ã— Ï€ Ã— rÂ³\nV = (4/3) Ã— 3.14 Ã— ${r}Â³\nV = (4/3) Ã— 3.14 Ã— ${r*r*r}\nV â‰ˆ ${Math.round(v)} cmÂ³`
      };
    },
    () => {
      // Sum of interior angles
      const n = randInt(3, 12);
      const sum = (n - 2) * 180;
      return {
        type: 'Sum of interior angles',
        question: `What is the sum of the interior angles of a ${n}-sided polygon?`,
        answer: sum,
        unit: 'Â°',
        solution: `Sum = (n - 2) Ã— 180Â°\nSum = (${n} - 2) Ã— 180Â°\nSum = ${n - 2} Ã— 180Â° = ${sum}Â°`
      };
    },
    () => {
      // Single exterior angle
      const n = randInt(3, 12);
      const ext = 360 / n;
      return {
        type: 'Exterior angle (regular polygon)',
        question: `What is the measure of one exterior angle of a regular ${n}-gon? (round to 2 decimals)`,
        answer: Number(ext.toFixed(2)),
        unit: 'Â°',
        solution: `Each exterior angle = 360Â° / n\n= 360Â° / ${n}\n= ${ext.toFixed(2)}Â°`
      };
    },
    () => {
      // y = mx + b: find y given x
      const m = randInt(-5, 5) || 2;
      const b = randInt(-10, 10);
      const x = randInt(-8, 8);
      const y = m * x + b;
      return {
        type: 'Linear equation',
        question: `For the equation y = ${m}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}, find y when x = ${x}.`,
        answer: y,
        unit: '',
        solution: `y = ${m}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\ny = ${m}(${x}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\ny = ${m*x} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\ny = ${y}`
      };
    },
  ];

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  const generate = () => {
    const fn = types[Math.floor(Math.random() * types.length)];
    setProblem(fn());
    setShowSolution(false);
    setUserAnswer('');
    setFeedback(null);
  };

  useEffect(() => { generate(); }, []);

  const checkAnswer = () => {
    if (!problem || !userAnswer.trim()) return;
    const userVal = parseFloat(userAnswer);
    const tolerance = Math.abs(problem.answer) * 0.02 + 0.05;
    const correct = Math.abs(userVal - problem.answer) < tolerance;
    setFeedback(correct ? 'correct' : 'incorrect');
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setShowSolution(true);
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/60">Random Problem Generator</div>
          <div className="text-xs text-blue-300">{problem.type}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Score</div>
          <div className="text-lg font-bold">{stats.correct} / {stats.total}</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="text-lg mb-4">{problem.question}</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Your answer"
            disabled={feedback}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-300"
          />
          <span className="self-center text-white/60">{problem.unit}</span>
          <button onClick={checkAnswer} disabled={feedback} className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 font-medium disabled:opacity-40">
            Check
          </button>
        </div>
        {feedback === 'correct' && <div className="mt-3 text-emerald-400 flex items-center gap-2"><Check className="w-5 h-5" /> Correct!</div>}
        {feedback === 'incorrect' && <div className="mt-3 text-red-400 flex items-center gap-2"><X className="w-5 h-5" /> Not quite. The answer was {problem.answer}{problem.unit}.</div>}
      </div>

      {showSolution && (
        <div className="glass rounded-2xl p-5">
          <div className="text-sm text-white/60 mb-2">Step-by-step solution:</div>
          <pre className="text-sm whitespace-pre-wrap font-mono text-blue-200">{problem.solution}</pre>
        </div>
      )}

      <button onClick={generate} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 font-medium">
        New Problem
      </button>
    </div>
  );
}

// ============================================================
// SCIENCE DIAGRAM LABELING (cell diagram)
// ============================================================
function DiagramLabel() {
  const [mode, setMode] = useState('plant'); // plant or animal
  const [labels, setLabels] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const plantParts = [
    { id: 'A', name: 'Vacuole', x: 55, y: 50 },
    { id: 'B', name: 'Cell wall', x: 78, y: 75 },
    { id: 'C', name: 'Cell membrane', x: 55, y: 88 },
    { id: 'D', name: 'Nucleus', x: 30, y: 70 },
    { id: 'E', name: 'Mitochondrion', x: 18, y: 50 },
    { id: 'F', name: 'Chloroplast', x: 25, y: 25 },
    { id: 'G', name: 'Golgi apparatus', x: 50, y: 30 },
  ];
  const animalParts = [
    { id: '1', name: 'Cell membrane', x: 25, y: 30 },
    { id: '2', name: 'Nucleus', x: 50, y: 35 },
    { id: '3', name: 'Cytoplasm', x: 70, y: 35 },
    { id: '4', name: 'Mitochondrion', x: 75, y: 50 },
    { id: '5', name: 'Vacuole', x: 75, y: 70 },
  ];

  const parts = mode === 'plant' ? plantParts : animalParts;
  const allOptions = [...new Set([...plantParts.map(p=>p.name), ...animalParts.map(p=>p.name)])];

  const submit = () => {
    let correct = 0;
    parts.forEach(p => { if (labels[p.id] === p.name) correct++; });
    setScore(correct);
    setSubmitted(true);
  };

  const reset = () => { setLabels({}); setSubmitted(false); setScore(0); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => { setMode('plant'); reset(); }} className={`px-4 py-2 rounded-lg ${mode === 'plant' ? 'bg-emerald-500/30 border border-emerald-400' : 'bg-white/5'}`}>Plant Cell</button>
        <button onClick={() => { setMode('animal'); reset(); }} className={`px-4 py-2 rounded-lg ${mode === 'animal' ? 'bg-pink-500/30 border border-pink-400' : 'bg-white/5'}`}>Animal Cell</button>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="relative w-full aspect-square max-w-md mx-auto mb-4 rounded-2xl overflow-hidden" style={{
          background: mode === 'plant'
            ? 'radial-gradient(circle at center, rgba(74, 222, 128, 0.2), rgba(34, 100, 50, 0.4))'
            : 'radial-gradient(circle at center, rgba(244, 114, 182, 0.2), rgba(150, 50, 100, 0.4))',
          border: mode === 'plant' ? '4px solid rgba(74, 222, 128, 0.5)' : '2px solid rgba(244, 114, 182, 0.5)',
        }}>
          {/* nucleus */}
          <div className="absolute rounded-full bg-purple-300/40 border-2 border-purple-300" style={{ left: mode==='plant' ? '20%' : '40%', top: mode==='plant' ? '60%' : '25%', width: '20%', height: '20%' }} />
          {/* labels */}
          {parts.map(p => (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 text-amber-900 font-bold flex items-center justify-center text-sm border-2 border-amber-200 shadow-lg"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.id}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {parts.map(p => {
            const isCorrect = submitted && labels[p.id] === p.name;
            const isWrong = submitted && labels[p.id] && labels[p.id] !== p.name;
            return (
              <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${isCorrect ? 'bg-emerald-500/20' : isWrong ? 'bg-red-500/20' : 'bg-white/5'}`}>
                <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-900 font-bold flex items-center justify-center text-sm">{p.id}</div>
                <select
                  disabled={submitted}
                  value={labels[p.id] || ''}
                  onChange={(e) => setLabels({...labels, [p.id]: e.target.value})}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">â€” Select â€”</option>
                  {allOptions.map(o => <option key={o} value={o} className="bg-slate-800">{o}</option>)}
                </select>
                {submitted && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                {submitted && isWrong && <span className="text-xs text-red-300">â†’ {p.name}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {!submitted ? (
        <button onClick={submit} disabled={Object.keys(labels).length < parts.length} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-medium disabled:opacity-40">
          Submit Labels
        </button>
      ) : (
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-2xl font-bold text-emerald-400">{score} / {parts.length} correct</div>
          <button onClick={reset} className="mt-3 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20">Try Again</button>
        </div>
      )}
    </div>
  );
}


// ============================================================
// VIDEOS VIEW
// ============================================================
function VideosView({ subject }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    storage.get(`videos_${subject}`, true).then(v => setVideos(v || []));
  }, [subject]);

  if (videos.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-white/60">
        <Youtube className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <div className="italic">No videos added yet.</div>
        <div className="text-sm mt-2">The admin can add YouTube links from the Admin Panel.</div>
      </div>
    );
  }

  const getEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="space-y-4">
      {videos.map((v, i) => {
        const embed = getEmbedUrl(v.url);
        return (
          <div key={i} className="glass rounded-2xl p-4">
            {v.title && <div className="font-medium mb-3">{v.title}</div>}
            {embed ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embed}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-white/50">Invalid YouTube URL: {v.url}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// NOTES VIEW (per-user notes)
// ============================================================
function NotesView({ subject, username }) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    storage.get(`notes_${username}_${subject}`).then(n => { if (n) setNotes(n); });
  }, [subject, username]);

  const handleChange = (val) => {
    setNotes(val);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await storage.set(`notes_${username}_${subject}`, val);
      setSaved(true);
    }, 800);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/60">
        <div>Your personal notes for this subject. Auto-saves to your browser.</div>
        <div className={saved ? 'text-emerald-400' : 'text-amber-300'}>
          {saved ? 'âœ“ Saved' : 'Saving...'}
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write your notes here. Things you keep forgetting, key formulas, mnemonics, anything..."
        className="w-full min-h-[400px] glass rounded-2xl p-5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-y"
        style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}
      />
    </div>
  );
}

// ============================================================
// MUSIC BAR (Spotify-style)
// ============================================================
function MusicBar({ musicLibrary, masterSound }) {
  const [playing, setPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(false);
  const audioRef = useRef(null);

  const current = musicLibrary[currentIdx];

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = masterSound ? volume : 0;
  }, [volume, masterSound]);

  useEffect(() => {
    if (!audioRef.current || !current) return;
    if (playing) audioRef.current.play().catch(()=>{});
    else audioRef.current.pause();
  }, [playing, currentIdx]);

  const next = () => {
    if (musicLibrary.length === 0) return;
    if (shuffle) {
      setCurrentIdx(Math.floor(Math.random() * musicLibrary.length));
    } else {
      setCurrentIdx((currentIdx + 1) % musicLibrary.length);
    }
  };

  const prev = () => {
    if (musicLibrary.length === 0) return;
    setCurrentIdx((currentIdx - 1 + musicLibrary.length) % musicLibrary.length);
  };

  const onTimeUpdate = (e) => {
    setProgress(e.target.currentTime);
    setDuration(e.target.duration || 0);
  };

  const onEnded = () => {
    if (loop) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      next();
    }
  };

  const seek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  };

  if (musicLibrary.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-white/10 px-4 py-2">
        <div className="flex items-center justify-center text-xs text-white/40">
          <Music className="w-4 h-4 mr-2" /> No music yet â€” admin can upload MP3s in the Admin Panel.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t border-white/10 bg-black/40">
      <audio
        ref={audioRef}
        src={current?.dataUrl}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />
      <div className="px-4 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{current?.title || 'Nothing playing'}</div>
            <div className="text-xs text-white/40 truncate">{musicLibrary.length} track(s) in library</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShuffle(!shuffle)} className={`p-2 rounded-lg ${shuffle ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`}><Shuffle className="w-4 h-4" /></button>
            <button onClick={prev} className="p-2 rounded-lg hover:bg-white/10"><SkipBack className="w-5 h-5" /></button>
            <button onClick={() => setPlaying(!playing)} className="p-3 rounded-full bg-white text-black hover:bg-white/90">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={next} className="p-2 rounded-lg hover:bg-white/10"><SkipForward className="w-5 h-5" /></button>
            <button onClick={() => setLoop(!loop)} className={`p-2 rounded-lg ${loop ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`}><Repeat className="w-4 h-4" /></button>
          </div>

          <div className="hidden md:flex items-center gap-2 min-w-[160px]">
            <Volume2 className="w-4 h-4 text-white/60" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-white"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
          <span className="tabular-nums w-10 text-right">{fmt(progress)}</span>
          <div onClick={seek} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-white/60" style={{ width: duration ? `${(progress/duration)*100}%` : '0%' }} />
          </div>
          <span className="tabular-nums w-10">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS VIEW
// ============================================================
function SettingsView({ bgChoice, setBgChoice, ambience, setAmbience, masterSound, setMasterSound, onBack }) {
  const backgrounds = [
    { key: 'rainy-window', label: 'Rainy Window', desc: 'Cozy default' },
    { key: 'dark-forest', label: 'Dark Rainy Forest', desc: 'Deep immersion' },
    { key: 'sunset-sky', label: 'Sunset Sky', desc: 'Warm tones' },
    { key: 'night-city', label: 'Night City', desc: 'Urban glow' },
    { key: 'minimal-dark', label: 'Minimal Dark', desc: 'No distractions' },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>Settings</h1>
      </header>

      <div className="space-y-6">

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Sound</h3>
            <button onClick={() => setMasterSound(!masterSound)} className={`px-3 py-1 rounded-full text-xs ${masterSound ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-white/60'}`}>
              Master {masterSound ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { key: 'rain', label: 'Rain', icon: Cloud },
              { key: 'wind', label: 'Wind', icon: Wind },
              { key: 'fire', label: 'Fireplace', icon: Flame },
            ].map(({ key, label, icon: AmbIcon }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm"><AmbIcon className="w-4 h-4" /> {label}</div>
                  <span className="text-xs text-white/50">{ambience[key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambience[key]}
                  onChange={(e) => setAmbience({ ...ambience, [key]: parseInt(e.target.value) })}
                  className="w-full accent-blue-300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-medium mb-4">Background</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {backgrounds.map(b => (
              <button
                key={b.key}
                onClick={() => setBgChoice(b.key)}
                className={`p-4 rounded-xl border text-left ${bgChoice === b.key ? 'border-white/40 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
              >
                <div className="font-medium">{b.label}</div>
                <div className="text-xs text-white/50">{b.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ height: '120px' }} />
    </div>
  );
}


// ============================================================
// ADMIN PANEL
// ============================================================
function AdminPanel({ examDates, setExamDates, musicLibrary, setMusicLibrary, onBack }) {
  const [activeTab, setActiveTab] = useState('exams');
  const [videoSubject, setVideoSubject] = useState('science');
  const [videos, setVideos] = useState({});
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  useEffect(() => {
    (async () => {
      const allVideos = {};
      for (const s of ['science','math','humanities','french']) {
        allVideos[s] = (await storage.get(`videos_${s}`, true)) || [];
      }
      setVideos(allVideos);
    })();
  }, []);

  const addVideo = async () => {
    if (!newVideoUrl) return;
    const updated = { ...videos };
    updated[videoSubject] = [...(updated[videoSubject] || []), { url: newVideoUrl, title: newVideoTitle }];
    setVideos(updated);
    await storage.set(`videos_${videoSubject}`, updated[videoSubject], true);
    setNewVideoUrl(''); setNewVideoTitle('');
  };

  const removeVideo = async (subject, idx) => {
    const updated = { ...videos };
    updated[subject] = updated[subject].filter((_, i) => i !== idx);
    setVideos(updated);
    await storage.set(`videos_${subject}`, updated[subject], true);
  };

  const handleMusicUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = [...musicLibrary];
    for (const file of files) {
      if (!file.type.startsWith('audio/')) continue;
      if (file.size > 4.5 * 1024 * 1024) {
        alert(`"${file.name}" is over ~4.5 MB. Storage limit is 5 MB per item. Use a smaller file or compress it.`);
        continue;
      }
      const dataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (ev) => res(ev.target.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      newTracks.push({
        title: file.name.replace(/\.[^.]+$/, ''),
        dataUrl,
        size: file.size,
      });
    }
    setMusicLibrary(newTracks);
    e.target.value = '';
  };

  const removeTrack = (idx) => {
    setMusicLibrary(musicLibrary.filter((_, i) => i !== idx));
  };

  const tabs = [
    { id: 'exams', label: 'Exam Dates' },
    { id: 'music', label: 'Music' },
    { id: 'videos', label: 'YouTube Videos' },
    { id: 'reset', label: 'Reset Data' },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
          <Lock className="w-5 h-5 text-amber-300" />
          <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>Admin Panel</h1>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === t.id ? 'bg-white/15 border border-white/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
          >{t.label}</button>
        ))}
      </div>

      {activeTab === 'exams' && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-medium mb-4">Exam Dates</h3>
          <div className="space-y-3">
            {Object.entries(examDates).map(([subj, date]) => (
              <div key={subj} className="flex items-center gap-3">
                <div className="w-24 capitalize text-white/70">{subj}</div>
                <input
                  type="datetime-local"
                  value={date.slice(0, 16)}
                  onChange={(e) => setExamDates({ ...examDates, [subj]: e.target.value + ':00' })}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-white/40 mt-4">Saved automatically. Visible to all users.</div>
        </div>
      )}

      {activeTab === 'music' && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-medium mb-4">Music Library</h3>
          <label className="block mb-4">
            <span className="text-sm text-white/70 mb-2 block">Upload MP3 files</span>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleMusicUpload}
              className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-black file:font-medium hover:file:bg-amber-300"
            />
            <div className="text-xs text-white/40 mt-2">
              Max ~4.5 MB per file. For longer tracks, compress to lower bitrate (e.g. 96 kbps) first.
            </div>
          </label>
          <div className="space-y-2">
            {musicLibrary.length === 0 && <div className="text-sm text-white/40 italic">No tracks yet.</div>}
            {musicLibrary.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Music className="w-4 h-4 text-white/60" />
                <div className="flex-1 truncate text-sm">{t.title}</div>
                <div className="text-xs text-white/40">{(t.size / 1024 / 1024).toFixed(2)} MB</div>
                <button onClick={() => removeTrack(i)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-medium mb-4">YouTube Videos</h3>
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <select value={videoSubject} onChange={(e) => setVideoSubject(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <option value="science" className="bg-slate-800">Science</option>
                <option value="math" className="bg-slate-800">Math</option>
                <option value="humanities" className="bg-slate-800">Humanities</option>
                <option value="french" className="bg-slate-800">French</option>
              </select>
              <input
                type="text"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                placeholder="Video title (optional)"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2"
              />
              <button onClick={addVideo} className="px-4 py-2 rounded-lg bg-amber-400 text-black font-medium hover:bg-amber-300">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
          </div>
          {Object.entries(videos).map(([subj, vids]) => (
            <div key={subj} className="mb-4">
              <div className="text-sm font-medium capitalize mb-2 text-white/70">{subj} ({vids.length})</div>
              {vids.length === 0 ? (
                <div className="text-xs text-white/40 italic">No videos.</div>
              ) : (
                <div className="space-y-1">
                  {vids.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded text-sm">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <div className="flex-1 truncate">{v.title || v.url}</div>
                      <button onClick={() => removeVideo(subj, i)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reset' && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg font-medium mb-2">Reset Data</h3>
          <p className="text-sm text-white/60 mb-4">Be careful â€” these actions cannot be undone.</p>
          <button
            onClick={async () => {
              if (!confirm('Reset YOUR personal progress? Other users keep theirs.')) return;
              const profile = await storage.get('profile_local');
              if (profile) {
                await storage.delete(`progress_${profile.username}`);
                alert('Your progress has been reset. Reload the page.');
              }
            }}
            className="w-full mb-2 py-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200"
          >
            Reset My Progress Only
          </button>
          <button
            onClick={async () => {
              if (!confirm('Wipe ALL leaderboard data (everyone\'s progress)? This cannot be undone.')) return;
              const userKeys = await storage.list('user_', true);
              for (const k of userKeys) await storage.delete(k, true);
              alert('Leaderboard wiped. Reload the page.');
            }}
            className="w-full py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200"
          >
            Wipe Entire Leaderboard
          </button>
        </div>
      )}

      <div style={{ height: '120px' }} />
    </div>
  );
}

// ============================================================
// LEADERBOARD VIEW
// ============================================================
function LeaderboardView({ allUsers, currentUser, onBack }) {
  const [sortBy, setSortBy] = useState('readiness');

  const sorted = [...allUsers].sort((a, b) => {
    if (sortBy === 'readiness') return (b.readiness || 0) - (a.readiness || 0);
    if (sortBy === 'streak') return (b.streak || 0) - (a.streak || 0);
    if (sortBy === 'quizzes') {
      const aq = Object.values(a.progress || {}).reduce((sum, s) => sum + (s.totalQuizzes || 0), 0);
      const bq = Object.values(b.progress || {}).reduce((sum, s) => sum + (s.totalQuizzes || 0), 0);
      return bq - aq;
    }
    return 0;
  });

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
        <Trophy className="w-6 h-6 text-amber-300" />
        <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>Leaderboard</h1>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { id: 'readiness', label: 'Overall Readiness' },
          { id: 'streak', label: 'Longest Streak' },
          { id: 'quizzes', label: 'Most Quizzes' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setSortBy(opt.id)}
            className={`px-4 py-2 rounded-lg text-sm ${sortBy === opt.id ? 'bg-white/15 border border-white/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
          >{opt.label}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-white/60">
          No students on the leaderboard yet. Share the link with your friends to compete!
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((u, i) => {
            const isMe = u.username === currentUser.username;
            const totalQuizzes = Object.values(u.progress || {}).reduce((sum, s) => sum + (s.totalQuizzes || 0), 0);
            return (
              <div key={u.username} className={`glass rounded-2xl p-4 flex items-center gap-4 ${isMe ? 'border-amber-300/50 bg-amber-300/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  i === 0 ? 'bg-amber-300 text-amber-900' :
                  i === 1 ? 'bg-slate-300 text-slate-900' :
                  i === 2 ? 'bg-amber-700 text-amber-100' :
                  'bg-white/10 text-white/70'
                }`}>{i + 1}</div>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  {u.picture ? <img src={u.picture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{u.realName[0]?.toUpperCase()}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">
                    {u.realName}
                    {isMe && <span className="text-xs bg-amber-300/30 text-amber-200 px-2 py-0.5 rounded-full">You</span>}
                  </div>
                  <div className="text-xs text-white/50 truncate">@{u.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {sortBy === 'readiness' && `${u.readiness || 0}%`}
                    {sortBy === 'streak' && `${u.streak || 0}ðŸ”¥`}
                    {sortBy === 'quizzes' && totalQuizzes}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40">
                    {sortBy === 'readiness' ? 'readiness' : sortBy === 'streak' ? 'day streak' : 'quizzes'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: '120px' }} />
    </div>
  );
}

// ============================================================
// PROFILE VIEW
// ============================================================
function ProfileView({ profile, progress, updateProfile, onBack, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.realName);
  const [editPic, setEditPic] = useState(profile.picture);

  // Calculate achievements
  const totalQuizzes = Object.values(progress).reduce((sum, s) => sum + (s.totalQuizzes || 0), 0);
  const totalMocks = Object.values(progress).reduce((sum, s) => sum + (s.mockExamScores?.length || 0), 0);
  const allQuizScores = Object.values(progress).flatMap(s => s.quizScores || []);
  const avgQuiz = allQuizScores.length ? allQuizScores.reduce((a,b)=>a+b,0) / allQuizScores.length : 0;

  const achievements = [
    { id: 'first-quiz', name: 'First Quiz', desc: 'Complete your first quiz', earned: totalQuizzes >= 1 },
    { id: '10-quizzes', name: '10 Quizzes', desc: 'Complete 10 quizzes', earned: totalQuizzes >= 10 },
    { id: '50-quizzes', name: '50 Quizzes', desc: 'Complete 50 quizzes', earned: totalQuizzes >= 50 },
    { id: '90-avg', name: '90% Average', desc: 'Maintain a 90% quiz average', earned: avgQuiz >= 0.9 && allQuizScores.length >= 5 },
    { id: 'first-mock', name: 'First Mock Exam', desc: 'Complete a mock exam', earned: totalMocks >= 1 },
    { id: '5-mocks', name: '5 Mock Exams', desc: 'Complete 5 mock exams', earned: totalMocks >= 5 },
    { id: 'sci-complete', name: 'Science Master', desc: 'Complete all Science topics', earned: Object.values(progress.science?.topics || {}).filter(Boolean).length >= SCIENCE_TOPICS.length },
    { id: 'math-complete', name: 'Math Master', desc: 'Complete all Math topics', earned: Object.values(progress.math?.topics || {}).filter(Boolean).length >= MATH_TOPICS.length },
  ];

  const earned = achievements.filter(a => a.earned);

  const handlePicUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2 MB image.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setEditPic(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveEdits = () => {
    updateProfile({ ...profile, realName: editName, picture: editPic });
    setEditing(false);
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 fade-in max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>Profile</h1>
        </div>
        <button onClick={onLogout} className="text-sm text-white/60 hover:text-red-300 flex items-center gap-1">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </header>

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
              {(editing ? editPic : profile.picture) ? (
                <img src={editing ? editPic : profile.picture} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-3xl font-bold">
                  {profile.realName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-400">
                <Upload className="w-3 h-3" />
                <input type="file" accept="image/*" onChange={handlePicUpload} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <div className="text-2xl font-medium">{profile.realName}</div>
            )}
            <div className="text-sm text-white/50">@{profile.displayUsername || profile.username}</div>
            <div className="text-xs text-white/40 mt-1">Joined {new Date(profile.joinedAt).toLocaleDateString()}</div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setEditName(profile.realName); setEditPic(profile.picture); }} className="px-3 py-2 rounded-lg bg-white/5">Cancel</button>
              <button onClick={saveEdits} className="px-3 py-2 rounded-lg bg-blue-500 font-medium">Save</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><Edit3 className="w-4 h-4" /></button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <div className="text-xs text-white/50">Quizzes</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold">{Math.round(avgQuiz * 100)}%</div>
            <div className="text-xs text-white/50">Quiz Avg</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold">{totalMocks}</div>
            <div className="text-xs text-white/50">Mocks</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-300" /> Achievements ({earned.length} / {achievements.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map(a => (
            <div key={a.id} className={`p-3 rounded-xl text-center ${a.earned ? 'bg-amber-300/20 border border-amber-300/50' : 'bg-white/5 border border-white/10 opacity-50'}`} title={a.desc}>
              <div className="text-2xl mb-1">{a.earned ? 'ðŸ†' : 'ðŸ”’'}</div>
              <div className="text-xs font-medium">{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '120px' }} />
    </div>
  );
}
