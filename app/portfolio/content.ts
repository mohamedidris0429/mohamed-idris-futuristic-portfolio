export const profile = {
  name: "P. Mohamed Idris",
  first: "P. MOHAMED",
  last: "IDRIS",
  role: "ECE Student × Aspiring VLSI Design Engineer",
  degree: "B.E. Electronics and Communication Engineering",
  college: "Sir Isaac Newton College",
  place: "Nagapattinam, Tamil Nadu",
  years: "2026 – 2030",
  portrait: "/images/profile.jpg",
  github: "https://github.com/mohamedidris0429",
  linkedin: "https://www.linkedin.com/in/mohamedidris4",
  interests: ["VLSI Design", "Semiconductor Technology", "Electronics", "Artificial Intelligence"],
};

export const navItems = [
  { id: "home", label: "Home", chapter: "00" },
  { id: "about", label: "About", chapter: "01" },
  { id: "education", label: "Education", chapter: "02" },
  { id: "skills", label: "Skills", chapter: "03" },
  { id: "projects", label: "Projects", chapter: "04" },
  { id: "certifications", label: "Certifications", chapter: "05" },
  { id: "learning", label: "Learning", chapter: "06" },
  { id: "contact", label: "Contact", chapter: "07" },
];

export const aboutCards = [
  {
    icon: "auto_stories",
    kicker: "ACADEMIC GENESIS",
    title: "The Path from Schooling to Sir Isaac Newton College",
    body: [
      "I completed my early schooling at Vivekanand Matric Hr. Sec. School in Sirkazhi and my higher secondary education at Adharsh Matric Hr. Sec. School in Nagapattinam.",
      "In 2026 I started my B.E. Electronics and Communication Engineering journey at Sir Isaac Newton College, Nagapattinam — the first step toward a career in VLSI design.",
    ],
    trail: ["SIRKAZHI", "NAGAPATTINAM", "B.E. ECE (2026–2030)"],
  },
  {
    icon: "memory",
    kicker: "TECHNICAL CURIOSITY",
    title: "What Excites Me Every Day",
    body: [
      "I am drawn to semiconductor technology and the layer where logic gates become working silicon — the direction behind my goal of becoming a VLSI Design Engineer.",
      "Alongside that I keep building creative front-end work: web animation, kinetic interfaces, electronics fundamentals and AI-assisted workflows.",
    ],
    trail: ["VLSI", "SEMICONDUCTORS", "ELECTRONICS", "AI"],
  },
  {
    icon: "terminal",
    kicker: "REALISTIC TRAJECTORY",
    title: "Zero Fluff, 100% Truth",
    body: [
      "No inflated titles, no invented client counts.",
      "Just an ECE student engineer learning by writing code, breaking things, publishing real open-source experiments and studying the hardware underneath it all.",
    ],
    trail: ["STUDENT", "ENGINEER", "OPEN SOURCE"],
  },
];

export const education = [
  {
    phase: "PHASE 01",
    period: "LKG – 8TH GRADE",
    status: "COMPLETED • SIRKAZHI",
    school: "Vivekanand Matric Hr. Sec. School",
    detail:
      "Primary and middle school foundation in Sirkazhi. Built early mathematical intuition, scientific interest and foundational logic.",
    modules: ["MATHEMATICS", "SCIENCE", "LOGIC"],
    current: false,
  },
  {
    phase: "PHASE 02",
    period: "9TH – 12TH GRADE",
    status: "COMPLETED • NAGAPATTINAM",
    school: "Adharsh Matric Hr. Sec. School",
    detail:
      "Secondary and higher secondary education in Nagapattinam, focused on Physics, Mathematics and Computer Science foundations — the spark for digital systems.",
    modules: ["PHYSICS", "MATHEMATICS", "COMPUTER SCIENCE"],
    current: false,
  },
  {
    phase: "PHASE 03 // ACTIVE",
    period: "2026 – 2030",
    status: "ENROLLED • IN PROGRESS",
    school: "Sir Isaac Newton College",
    detail:
      "B.E. Electronics and Communication Engineering (ECE) in Nagapattinam. Coursework across electronic circuits, digital logic, signals and systems, microcontrollers and communication protocols, with VLSI design as the intended specialisation.",
    modules: ["ELECTRONIC CIRCUITS", "DIGITAL LOGIC", "SIGNALS & SYSTEMS", "CORE FOCUS: VLSI"],
    current: true,
  },
];

export type SkillGroup = {
  icon: string;
  kicker: string;
  title: string;
  items: { name: string; note: string; tag: string }[];
};

export const skillGroups: SkillGroup[] = [
  {
    icon: "code",
    kicker: "CORE STACK",
    title: "Frontend Engineering",
    items: [
      { name: "HTML5 & Semantic Web", note: "Accessible structure, clean document hierarchy", tag: "VERIFIED" },
      { name: "CSS3 & Modern Layouts", note: "Flexbox, Grid, custom properties, responsive design", tag: "VERIFIED" },
      { name: "JavaScript (ES6+)", note: "DOM manipulation, events, timing functions", tag: "VERIFIED" },
    ],
  },
  {
    icon: "animation",
    kicker: "EXPERIMENTS",
    title: "Creative Development",
    items: [
      { name: "Scroll-Driven Animation", note: "Scroll depth choreography and motion sampling", tag: "APPLIED" },
      { name: "CSS Keyframes", note: "Cubic-bezier timing, transitions, physical feel", tag: "APPLIED" },
      { name: "Canvas & SVG", note: "Vector animation and 2D drawing loops", tag: "APPLIED" },
    ],
  },
  {
    icon: "memory",
    kicker: "CURRICULUM",
    title: "VLSI & Semiconductors",
    items: [
      { name: "Digital Logic Design", note: "Boolean algebra, gates, state machines", tag: "CURRICULUM" },
      { name: "Electronic Circuits", note: "Devices, signal paths, circuit principles", tag: "CURRICULUM" },
      { name: "Signals & Systems", note: "Sampling, transforms, system response", tag: "CURRICULUM" },
    ],
  },
  {
    icon: "build",
    kicker: "DAILY TOOLING",
    title: "Tools & Workflow",
    items: [
      { name: "Git & GitHub", note: "Version control, repositories, GitHub Pages", tag: "ACTIVE" },
      { name: "VS Code", note: "Configured workspace, terminal, linting", tag: "ACTIVE" },
      { name: "AI-Assisted Workflows", note: "Scaffolding, debugging and accelerated learning", tag: "ACTIVE" },
    ],
  },
];

export const projects = [
  {
    index: "PROJECT_01",
    kind: "SCROLL-DRIVEN INTERACTION",
    title: "Bike Scroll Animation",
    status: "LIVE EXPERIMENT",
    description:
      "An interactive scroll-linked animation experiment translating page scroll velocity and depth into frame-accurate motorcycle kinematics and kinetic typography.",
    tags: ["HTML5", "CSS3 Animations", "JavaScript", "Scroll Events"],
    links: [
      {
        label: "Repository on GitHub",
        href: "https://github.com/mohamedidris0429/BIKE-SCROLL-ANIMATION",
      },
    ],
    readout: ["TELEMETRY: KINEMATICS", "GEAR: 5TH [48/16]", "SCROLL_SYNC: 60 FPS"],
    image: "/images/bike-preview.jpg",
  },
  {
    index: "PROJECT_02",
    kind: "CINEMATIC WEB EXPERIENCE",
    title: "Car Scroll Animation",
    status: "LIVE EXPERIMENT",
    description:
      "An automotive web presentation with synchronized scroll mechanics, road perspective simulation and responsive visual transitions, built with standard web technologies.",
    tags: ["HTML5", "Modern CSS Flex/Grid", "JavaScript", "Motion Choreography"],
    links: [
      {
        label: "Repository on GitHub",
        href: "https://github.com/mohamedidris0429/CAR-SCROLL-ANIMATION",
      },
    ],
    readout: ["HUD: AUTOMOTIVE KINETICS", "ROAD_SIM // ACTIVE", "TACHOMETER: 6800 RPM"],
    image: "/images/car-preview.jpg",
  },
  {
    index: "PROJECT_03",
    kind: "IDENTITY REPOSITORY",
    title: "Developer Profile / About Me",
    status: "OPEN SOURCE",
    description:
      "Developer landing page and GitHub profile ecosystem consolidating technical journey logs, repositories, educational background and contact endpoints.",
    tags: ["Markdown", "GitHub Profile README", "Web Standards"],
    links: [
      {
        label: "Repository on GitHub",
        href: "https://github.com/mohamedidris0429/mohamedidris0429",
      },
    ],
    readout: ["role: ECE Student & Creative Developer", "git log: c429a1f main", "STATUS: 200 OK"],
  },
  {
    index: "PROJECT_04",
    kind: "INDUSTRIAL IOT & ECE TELEMETRY",
    title: "Industria — Smart Machine Monitoring",
    status: "SOFTWARE PROTOTYPE • SIMULATION",
    description:
      "An ECE-focused industrial IoT prototype showing how machine temperature, vibration, current and voltage can be monitored through an interactive dashboard.",
    tags: ["HTML", "CSS", "JavaScript", "IoT Concept", "Data Visualization"],
    links: [
      {
        label: "Live Demo",
        href: "https://mohamedidris0429.github.io/INDUSTRIA/",
      },
      {
        label: "Repository on GitHub",
        href: "https://github.com/mohamedidris0429/INDUSTRIA",
      },
    ],
    readout: ["SCADA / IOT RIG", "TEMP 74.2 °C", "BUS 415.8 V", "SENSOR: ESP32_VIRTUAL"],
    image: "/images/industria-preview.jpg",
  },
  {
    index: "PROJECT_05",
    kind: "CLEAN ENERGY & BMS TELEMETRY",
    title: "Smart Second-Life EV Battery System",
    status: "DIGITAL PROTOTYPE • SIMULATION",
    description:
      "A digital prototype for reusing degraded EV batteries as solar energy storage and automatic emergency home backup power.",
    tags: ["HTML5", "CSS3", "JavaScript", "Solar Energy", "Battery Management"],
    links: [],
    readout: ["BMS: SIMULATED", "STORAGE: SOLAR BUFFER", "MODE: BACKUP"],
    image: "/images/ev-battery-preview.png",
  },
];

export const learningStages = [
  {
    index: "01",
    title: "Learn",
    body: "Understand core engineering concepts, dissect documentation, read the standards and study modern web and hardware fundamentals from first principles.",
  },
  {
    index: "02",
    title: "Build",
    body: "Translate abstract ideas into working code. Test responsive behaviour across viewports and engineer interactions that hold up in real use.",
  },
  {
    index: "03",
    title: "Experiment",
    body: "Push creative boundaries with scroll physics, keyframe choreography and distinctive interface systems — while exploring the silicon side of the stack.",
  },
  {
    index: "04",
    title: "Improve",
    body: "Refactor, optimise performance, gather feedback from peers and iterate toward engineering mastery with every commit.",
  },
];

export const learningVectors = [
  {
    label: "UI / KINETICS",
    title: "Creative UI & Micro-Interactions",
    tag: "EXPERIMENTING",
    body: "Bespoke hover states, cursor physics, tactile button transitions and responsive layout elasticity.",
  },
  {
    label: "ECE_HARDWARE",
    title: "ECE Hardware & Signal Logic",
    tag: "FOUNDATIONAL",
    body: "Bridging circuit laboratory principles with microcontrollers, digital sampling, UART/I2C communication and embedded firmware.",
  },
  {
    label: "VLSI_TRACK",
    title: "VLSI & Semiconductor Technology",
    tag: "CAREER FOCUS",
    body: "Digital logic, circuit behaviour and the path from logic gates to fabricated silicon — the direction I am building toward.",
  },
  {
    label: "AI_WORKFLOW",
    title: "AI-Assisted Development",
    tag: "INTEGRATING",
    body: "Accelerating learning iterations with generative coding workflows, prompt-driven prototyping and automated refactoring.",
  },
];

export const contactChannels = [
  {
    network: "GH",
    name: "GitHub",
    handle: "@mohamedidris0429",
    description:
      "Source code for my scroll animation experiments, repositories, commit history and ongoing prototypes.",
    meta: "REPOSITORY MATRIX",
    href: "https://github.com/mohamedidris0429",
    cta: "OPEN PROFILE",
  },
  {
    network: "IN",
    name: "LinkedIn",
    handle: "/in/mohamedidris4",
    description:
      "Academic networking, engineering collaborations, creative web projects and conversations about VLSI and emerging tech.",
    meta: "PROFESSIONAL NETWORK",
    href: "https://www.linkedin.com/in/mohamedidris4",
    cta: "CONNECT",
  },
];

export const certificateCategories = [
  { id: "all", label: "ALL CREDENTIALS" },
  { id: "ece", label: "ECE & EMBEDDED" },
  { id: "web", label: "CREATIVE CODE & WEB" },
  { id: "iot", label: "INDUSTRIAL IOT" },
  { id: "academic", label: "ACADEMIC CORE" },
];

export const categoryLabels: Record<string, string> = {
  ece: "ECE & Embedded",
  web: "Creative Code & Web",
  iot: "Industrial IoT",
  academic: "Academic Core",
};