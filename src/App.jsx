import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, Unlock, Settings, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Upload, Trash2, Edit3, Plus, X, Check, ChevronRight, ChevronLeft, Trophy, Flame, Target, BookOpen, Calculator, Globe, Languages, Cloud, Moon, Zap, Award, Clock, TrendingUp, Eye, EyeOff, RotateCcw, Save, Home, User, LogOut, Search, FileText, Youtube, Music, Wind, Headphones } from 'lucide-react';

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

