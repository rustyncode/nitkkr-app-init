// ─── NIT KKR Subject Code → Subject Name Mapping ───────────
//
// This mapping allows users to search papers by subject name
// in addition to subject code. Covers all major departments.
//
// Format: { "SUBJECT_CODE": "Subject Name" }

const SUBJECT_NAMES = {
  // ─── Computer Science & Engineering (CS) ──────────────────
  CSPC10: "Programming Fundamentals",
  CSPC11: "Data Structures",
  CSPC12: "Object Oriented Programming",
  CSPC13: "Computer Organization",
  CSPC14: "Discrete Mathematics",
  CSPC15: "Database Management Systems",
  CSPC16: "Operating Systems",
  CSPC17: "Computer Networks",
  CSPC18: "Design & Analysis of Algorithms",
  CSPC19: "Theory of Computation",
  CSPC20: "Compiler Design",
  CSPC21: "Software Engineering",
  CSPC22: "Artificial Intelligence",
  CSPC23: "Machine Learning",
  CSPC24: "Computer Architecture",
  CSPC25: "Web Technologies",
  CSPC26: "Digital Logic Design",
  CSPC27: "Microprocessors",
  CSPC28: "Computer Graphics",
  CSPC29: "Information Security",
  CSPC30: "Cloud Computing",
  CSPC31: "Data Mining",
  CSPC32: "Distributed Systems",
  CSPC33: "Internet of Things",
  CSPC34: "Natural Language Processing",
  CSPC35: "Deep Learning",
  CSPC36: "Big Data Analytics",
  CSPE10: "Image Processing",
  CSPE11: "Pattern Recognition",
  CSPE12: "Soft Computing",
  CSPE13: "Blockchain Technology",
  CSPE14: "Cyber Security",
  CSPE15: "Mobile Computing",
  CSPE16: "Parallel Computing",
  CSPE17: "Quantum Computing",
  CSPE18: "Embedded Systems",
  CSPE19: "Game Theory",
  CSPE20: "Bioinformatics",
  CSPE21: "Human Computer Interaction",
  CSPE22: "Social Network Analysis",
  CSPE23: "Robotics",
  CSPE24: "Advanced Algorithms",
  CSPE25: "Computational Geometry",

  // ─── Information Technology (IT) ──────────────────────────
  ITPC10: "Programming Fundamentals",
  ITPC11: "Data Structures",
  ITPC12: "Object Oriented Programming",
  ITPC13: "Computer Organization",
  ITPC14: "Discrete Structures",
  ITPC15: "Database Systems",
  ITPC16: "Operating Systems",
  ITPC17: "Computer Networks",
  ITPC18: "Algorithm Design",
  ITPC19: "Automata Theory",
  ITPC20: "Compiler Construction",
  ITPC21: "Software Engineering",
  ITPC22: "Web Engineering",
  ITPC23: "Information Security",
  ITPC24: "Data Analytics",
  ITPC25: "Cloud Computing",
  ITPC26: "Digital Electronics",
  ITPE10: "Machine Learning",
  ITPE11: "Artificial Intelligence",
  ITPE12: "Internet of Things",
  ITPE13: "Network Security",
  ITPE14: "Multimedia Systems",
  ITPE15: "E-Commerce",

  // ─── Electronics & Communication Engineering (EC) ─────────
  ECPC10: "Basic Electronics",
  ECPC11: "Network Analysis",
  ECPC12: "Electronic Devices & Circuits",
  ECPC13: "Signals & Systems",
  ECPC14: "Digital Electronics",
  ECPC15: "Analog Communication",
  ECPC16: "Digital Communication",
  ECPC17: "Electromagnetic Theory",
  ECPC18: "Microprocessors & Microcontrollers",
  ECPC19: "Control Systems",
  ECPC20: "VLSI Design",
  ECPC21: "Digital Signal Processing",
  ECPC22: "Antenna & Wave Propagation",
  ECPC23: "Microwave Engineering",
  ECPC24: "Optical Communication",
  ECPC25: "Embedded Systems",
  ECPC26: "Communication Systems",
  ECPC27: "Wireless Communication",
  ECPC28: "Information Theory & Coding",
  ECPE10: "Radar Engineering",
  ECPE11: "Satellite Communication",
  ECPE12: "Biomedical Electronics",
  ECPE13: "Nanoelectronics",
  ECPE14: "Speech Processing",
  ECPE15: "Sensor Technology",

  // ─── Electrical Engineering (EE) ──────────────────────────
  EEPC10: "Basic Electrical Engineering",
  EEPC11: "Circuit Theory",
  EEPC12: "Electrical Machines I",
  EEPC13: "Electrical Machines II",
  EEPC14: "Power Systems I",
  EEPC15: "Power Systems II",
  EEPC16: "Control Systems",
  EEPC17: "Power Electronics",
  EEPC18: "Electrical Measurements",
  EEPC19: "Digital Electronics",
  EEPC20: "Signals & Systems",
  EEPC21: "Electromagnetic Fields",
  EEPC22: "Switchgear & Protection",
  EEPC23: "Microprocessors",
  EEPC24: "Utilization of Electrical Energy",
  EEPC25: "High Voltage Engineering",
  EEPE10: "Renewable Energy Systems",
  EEPE11: "Electric Drives",
  EEPE12: "Smart Grid",
  EEPE13: "Power System Protection",
  EEPE14: "Flexible AC Transmission Systems",

  // ─── Mechanical Engineering (ME) ──────────────────────────
  MEPC10: "Engineering Mechanics",
  MEPC11: "Strength of Materials",
  MEPC12: "Thermodynamics",
  MEPC13: "Fluid Mechanics",
  MEPC14: "Manufacturing Processes",
  MEPC15: "Theory of Machines",
  MEPC16: "Machine Design",
  MEPC17: "Heat Transfer",
  MEPC18: "Industrial Engineering",
  MEPC19: "Internal Combustion Engines",
  MEPC20: "Refrigeration & Air Conditioning",
  MEPC21: "Dynamics of Machinery",
  MEPC22: "Power Plant Engineering",
  MEPC23: "Automobile Engineering",
  MEPC24: "CAD/CAM",
  MEPC25: "Robotics",
  MEPC26: "Finite Element Methods",
  MEPE10: "Computational Fluid Dynamics",
  MEPE11: "Tribology",
  MEPE12: "Composite Materials",
  MEPE13: "Mechatronics",
  MEPE14: "Non-Conventional Energy",
  MEPE15: "Turbo Machinery",

  // ─── Civil Engineering (CE) ───────────────────────────────
  CEPC10: "Engineering Mechanics",
  CEPC11: "Strength of Materials",
  CEPC12: "Surveying",
  CEPC13: "Building Materials & Construction",
  CEPC14: "Fluid Mechanics",
  CEPC15: "Structural Analysis I",
  CEPC16: "Structural Analysis II",
  CEPC17: "Geotechnical Engineering",
  CEPC18: "Transportation Engineering",
  CEPC19: "Environmental Engineering",
  CEPC20: "Design of Steel Structures",
  CEPC21: "Design of Concrete Structures",
  CEPC22: "Hydrology & Water Resources",
  CEPC23: "Estimation & Costing",
  CEPC24: "Construction Management",
  CEPC25: "Foundation Engineering",
  CEPE10: "Earthquake Engineering",
  CEPE11: "Bridge Engineering",
  CEPE12: "Remote Sensing & GIS",
  CEPE13: "Advanced Structural Analysis",
  CEPE14: "Pavement Design",
  CEPE15: "Ground Improvement Techniques",

  // ─── Chemical Engineering (CH) ────────────────────────────
  CHPC10: "Chemical Engineering Thermodynamics",
  CHPC11: "Fluid Mechanics",
  CHPC12: "Heat Transfer",
  CHPC13: "Mass Transfer",
  CHPC14: "Chemical Reaction Engineering",
  CHPC15: "Process Dynamics & Control",
  CHPC16: "Chemical Technology",
  CHPC17: "Mechanical Operations",
  CHPC18: "Environmental Engineering",
  CHPC19: "Process Equipment Design",
  CHPC20: "Petroleum Refining",
  CHPE10: "Polymer Technology",
  CHPE11: "Biochemical Engineering",
  CHPE12: "Process Simulation",
  CHPE13: "Corrosion Engineering",
  CHPE14: "Nanotechnology",

  // ─── Production & Industrial Engineering (PI) ─────────────
  PIPC10: "Manufacturing Technology",
  PIPC11: "Metal Cutting",
  PIPC12: "Work Study & Ergonomics",
  PIPC13: "Quality Engineering",
  PIPC14: "Operations Research",
  PIPC15: "Production Planning & Control",
  PIPC16: "Tool Engineering",
  PIPC17: "Metrology",
  PIPC18: "Supply Chain Management",
  PIPC19: "Computer Integrated Manufacturing",
  PIPC20: "Casting & Welding",
  PIPE10: "Lean Manufacturing",
  PIPE11: "Six Sigma",
  PIPE12: "Reliability Engineering",
  PIPE13: "Advanced Manufacturing",

  // ─── Institute Required / Common Subjects (IR) ────────────
  HSIR11: "Engineering Economics",
  HSIR12: "Principles of Management",
  HSIR13: "Industrial Psychology",
  HSIR14: "Professional Ethics",
  HSIR15: "Technical Communication",
  HSIR16: "Organizational Behavior",
  HSIR17: "Sociology",
  HSIR18: "Economics",

  MAIR11: "Engineering Mathematics I",
  MAIR12: "Engineering Mathematics II",
  MAIR13: "Engineering Mathematics III",
  MAIR14: "Probability & Statistics",
  MAIR15: "Numerical Methods",
  MAIR16: "Linear Algebra",
  MAIR17: "Complex Analysis",
  MAIR18: "Differential Equations",
  MAIR19: "Discrete Mathematics",
  MAIR20: "Optimization Techniques",

  PHIR11: "Engineering Physics",
  PHIR12: "Applied Physics",
  PHIR13: "Modern Physics",
  PHIR14: "Quantum Mechanics",
  PHIR15: "Optics",
  PHIR16: "Solid State Physics",

  CHIR11: "Engineering Chemistry",
  CHIR12: "Environmental Science",

  // ─── Mathematics Department (MA) ──────────────────────────
  MAPC10: "Real Analysis",
  MAPC11: "Complex Analysis",
  MAPC12: "Abstract Algebra",
  MAPC13: "Linear Algebra",
  MAPC14: "Differential Equations",
  MAPC15: "Numerical Analysis",
  MAPC16: "Probability & Statistics",
  MAPC17: "Topology",
  MAPC18: "Functional Analysis",
  MAPC19: "Discrete Mathematics",
  MAPC20: "Operations Research",
  MAPC21: "Mathematical Modelling",
  MAPC22: "Number Theory",

  // ─── Physics Department (PH) ──────────────────────────────
  PHPC10: "Classical Mechanics",
  PHPC11: "Quantum Mechanics",
  PHPC12: "Electrodynamics",
  PHPC13: "Statistical Mechanics",
  PHPC14: "Solid State Physics",
  PHPC15: "Nuclear Physics",
  PHPC16: "Optics",
  PHPC17: "Atomic & Molecular Physics",
  PHPC18: "Mathematical Physics",

  // ─── Humanities & Social Sciences (HS) ────────────────────
  HSPC10: "Economics",
  HSPC11: "Management",
  HSPC12: "English Communication",
  HSPC13: "Sociology",
  HSPC14: "Psychology",
  HSPC15: "Philosophy",

  // ─── Open Electives (OE) ─────────────────────────────────
  CSOE10: "Introduction to Programming",
  CSOE11: "Python Programming",
  CSOE12: "Data Science Fundamentals",
  CSOE13: "Web Development",
  CSOE14: "Cyber Security Basics",
  ECOE10: "Introduction to Electronics",
  ECOE11: "Communication Systems Basics",
  EEOE10: "Basics of Electrical Engineering",
  EEOE11: "Renewable Energy",
  MEOE10: "Basics of Mechanical Engineering",
  MEOE11: "Engineering Drawing",
  CEOE10: "Environmental Studies",
  CEOE11: "Disaster Management",

  // ─── Technical Core (TC) ─────────────────────────────────
  CSTC10: "Data Structures & Algorithms",
  CSTC11: "Operating Systems",
  CSTC12: "Database Management",
  ECTC10: "Signals & Systems",
  ECTC11: "Digital Electronics",
  EETC10: "Electrical Machines",
  EETC11: "Power Systems",
  METC10: "Thermodynamics",
  METC11: "Fluid Mechanics",
  CETC10: "Structural Analysis",
  CETC11: "Geotechnical Engineering",
};

// ─── Reverse mapping: Subject Name → Subject Codes ──────────
// Allows searching by name and finding all matching codes.
const NAME_TO_CODES = {};
for (const [code, name] of Object.entries(SUBJECT_NAMES)) {
  const lowerName = name.toLowerCase();
  if (!NAME_TO_CODES[lowerName]) {
    NAME_TO_CODES[lowerName] = [];
  }
  NAME_TO_CODES[lowerName].push(code);
}

/**
 * Get subject name from code.
 * Returns the name if found, otherwise returns null.
 *
 * @param {string} code - Subject code (e.g., "CSPC20")
 * @returns {string|null}
 */
export function getSubjectName(code) {
  if (!code) return null;
  const stringCode = String(code).toUpperCase();
  return SUBJECT_NAMES[stringCode] || null;
}

/**
 * Search subject names and return matching codes.
 * Useful when user types a subject name in search.
 *
 * @param {string} query - Search query (partial subject name)
 * @returns {string[]} - Array of matching subject codes
 */
export function searchBySubjectName(query) {
  if (!query || query.trim().length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const matchingCodes = [];

  for (const [code, name] of Object.entries(SUBJECT_NAMES)) {
    if (name.toLowerCase().includes(normalizedQuery)) {
      matchingCodes.push(code);
    }
  }

  return matchingCodes;
}

/**
 * Check if a query looks like a subject name (non-code text).
 * Subject codes typically follow patterns like CSPC20, EEPC11, etc.
 *
 * @param {string} query
 * @returns {boolean}
 */
export function looksLikeSubjectName(query) {
  if (!query) return false;
  const trimmed = String(query).trim();
  if (trimmed.length < 3) return false;

  // Subject codes are typically 4-6 uppercase letters followed by digits
  const codePattern = /^[A-Z]{2,6}\d{2,3}$/i;
  // If it matches a code pattern, it's NOT a subject name
  if (codePattern.test(trimmed)) return false;
  // If it contains spaces or is mostly alphabetic, it looks like a name
  const hasSpaces = trimmed.includes(" ");
  const isAlphabetic = /^[a-zA-Z\s&\-,]+$/.test(trimmed);
  return hasSpaces || (isAlphabetic && trimmed.length >= 4);
}

export { SUBJECT_NAMES, NAME_TO_CODES };
export default SUBJECT_NAMES;
