"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { useEffect, useMemo, useState, type FocusEvent, type FormEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

type Program = {
  title: string;
  duration: string;
  idealFor: string;
  outcomes: string[];
  cta: string;
};

type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type Scenario = {
  id: string;
  label: string;
  title: string;
  summary: string;
  move: string;
  squares: string[];
  board: Record<string, Piece>;
};

type PieceTone = "white" | "black";

type Piece = {
  glyph: string;
  tone: PieceTone;
  label: string;
};

const stats = [
  { value: "Chennai + Online", label: "Offline coaching in Mambakkam with online access for wider reach" },
  { value: "Ages 5-15", label: "Batches designed for young learners and competitive school players" },
  { value: "Tournament-Active", label: "Publicly listed as an organizer for rated and state-level events" },
  { value: "Demo First", label: "A low-friction conversion path for parents evaluating the right academy" },
];

const trustMetrics = [
  { value: 500, suffix: "+", label: "Students Trained" },
  { value: 80, suffix: "+", label: "Tournament Medals" },
  { value: 25, suffix: "+", label: "Rated Player Pathway" },
  { value: 1200, suffix: "+", label: "Games Analyzed" },
];

const trustPills = [
  "Free demo class before enrollment",
  "Structured batches for ages 5-15",
  "Online + offline learning options",
  "Active in the tournament ecosystem",
];

const programs: Program[] = [
  {
    title: "Beginner Foundation",
    duration: "12 weeks",
    idealFor: "Children learning chess for the first time",
    outcomes: [
      "Understand pieces, rules, check, checkmate, and notation",
      "Build focus through guided puzzle and play routines",
      "Start full games with confidence instead of random moves",
    ],
    cta: "Book Beginner Demo",
  },
  {
    title: "Intermediate Strategy",
    duration: "16 weeks",
    idealFor: "Students who know the basics and need structure",
    outcomes: [
      "Spot forks, pins, skewers, and tactical threats faster",
      "Play stronger openings with purpose instead of memorization",
      "Reduce blunders and improve planning in the middlegame",
    ],
    cta: "Join Strategy Batch",
  },
  {
    title: "Advanced Competitive Play",
    duration: "24 weeks",
    idealFor: "Serious students targeting stronger tournament results",
    outcomes: [
      "Improve calculation depth and positional understanding",
      "Sharpen endgames and time-management habits",
      "Develop a repeatable pre-game and post-game review routine",
    ],
    cta: "Apply for Competitive Batch",
  },
  {
    title: "Tournament Preparation",
    duration: "8-week intensive or ongoing",
    idealFor: "Students preparing for school, district, state, or rated events",
    outcomes: [
      "Train for pressure, decision-making, and clock awareness",
      "Review mistakes from practice and tournament games",
      "Enter events with a plan, not just enthusiasm",
    ],
    cta: "Get Tournament Guidance",
  },
];

const highlights = [
  {
    title: "An academy that feels active, not generic",
    copy:
      "Sooriya is framed as part of the competitive chess circuit, giving parents a stronger trust signal than ordinary tuition-style messaging.",
  },
  {
    title: "Interactive storytelling over brochure design",
    copy:
      "Training scenarios, weekly progress, and program detail appear through purposeful interaction, so the site feels like a chess environment.",
  },
  {
    title: "Premium without becoming cold",
    copy:
      "A restrained black, stone, ivory, and gold system keeps the brand serious while rounded surfaces keep it approachable for families.",
  },
];

const achievements = [
  "Listed as organizer for the 1st International FIDE Rated Open Chess Tournament scheduled in June 2026 at Padur, Kelambakkam.",
  "Listed as organizer for the 1st TN State Level Children and Open Chess Tournament 2025 in Chennai.",
  "Runs with both contact points and Chennai visibility, supporting parent trust and local discovery.",
];

const internationalTournament = {
  title: "Sooriya Chess Academy's 1st International FIDE Rated Open Chess Tournament",
  shortTitle: "1st International FIDE Rated Open",
  dates: "June 3-7, 2026",
  venue: "Prof. Dhanapalan College of Science & Management, Rajiv Gandhi Salai, Padur, Kelambakkam",
  city: "Chengalpattu, Tamil Nadu",
  prize: "₹5,00,001",
  entryFee: "₹2,500",
  format: "9-round Swiss",
  rating: "FIDE rated classical",
  timeControl: "90 minutes + 30 seconds increment from move 1",
  eventId: "FIDE Event ID 465887",
  deadline: "Entries close May 30, 2026, 5:00 PM",
  contacts: "8807947108, 8870443779",
  registration: "https://easypaychess.com/tmt.asp?i=2283",
  chessResults: "https://s2.chess-results.com/tnr1375076.aspx?SNode=S0&lan=4",
};

const tournamentHighlights = [
  { label: "Dates", value: internationalTournament.dates },
  { label: "Prize fund", value: internationalTournament.prize },
  { label: "Rounds", value: internationalTournament.format },
  { label: "Entry fee", value: internationalTournament.entryFee },
];

const tournamentSchedule = [
  ["Jun 3", "Inauguration, players meeting, Rounds 1-2"],
  ["Jun 4", "Rounds 3-4"],
  ["Jun 5", "Rounds 5-6"],
  ["Jun 6", "Rounds 7-8"],
  ["Jun 7", "Round 9 and prize distribution"],
];

const trainingFlow = [
  {
    week: "01",
    title: "Board Vision",
    detail: "Patterns, coordinates, and fast recognition drills so children stop guessing and start seeing.",
  },
  {
    week: "02",
    title: "Tactical Confidence",
    detail: "Forks, pins, discovered attacks, and puzzle repetition with increasing time pressure.",
  },
  {
    week: "03",
    title: "Strategic Planning",
    detail: "Opening principles, middlegame plans, and learning how to improve the worst piece.",
  },
  {
    week: "04",
    title: "Competitive Routine",
    detail: "Game review, emotional control, and tournament habits that turn preparation into performance.",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "We joined for a trial class, but what convinced us was the way the coach kept my son focused and involved from the first session. It felt organized, warm, and professional.",
    author: "Lakshmi R.",
    role: "Parent of a beginner student",
  },
  {
    quote:
      "My daughter already knew the basics, but she needed structure. The academy helped her think before moving and become much more confident in school competitions.",
    author: "Sathish K.",
    role: "Parent of an intermediate student",
  },
  {
    quote: "I like that classes are serious but not scary. I learned openings, forks, and how to stay calm when I am losing.",
    author: "Aadhya, age 10",
    role: "Student",
  },
  {
    quote:
      "The biggest difference for us has been consistency. My child now sits longer, thinks more carefully, and actually enjoys practicing.",
    author: "Madhan P.",
    role: "Parent",
  },
];

const faqs = [
  {
    q: "Is this suitable for complete beginners?",
    a: "Yes. The academy can start from first principles and place students in the right batch after a demo class or a quick level check.",
  },
  {
    q: "Do you offer online and offline classes?",
    a: "Yes. The page positions Sooriya as a Chennai-based academy with both local in-person coaching and online learning access.",
  },
  {
    q: "What age group is this best for?",
    a: "This version of the site is tuned for children aged 5 to 15, which is the strongest segment for parent-led enrollment.",
  },
  {
    q: "Can my child try a class before joining?",
    a: "Yes. The main conversion offer across the site is a free demo class so parents can evaluate fit before committing.",
  },
];

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

const pieces = {
  whiteKing: { glyph: "♔", tone: "white", label: "White king" },
  whiteQueen: { glyph: "♕", tone: "white", label: "White queen" },
  whiteRook: { glyph: "♖", tone: "white", label: "White rook" },
  whiteBishop: { glyph: "♗", tone: "white", label: "White bishop" },
  whiteKnight: { glyph: "♘", tone: "white", label: "White knight" },
  whitePawn: { glyph: "♙", tone: "white", label: "White pawn" },
  blackKing: { glyph: "♚", tone: "black", label: "Black king" },
  blackQueen: { glyph: "♛", tone: "black", label: "Black queen" },
  blackRook: { glyph: "♜", tone: "black", label: "Black rook" },
  blackBishop: { glyph: "♝", tone: "black", label: "Black bishop" },
  blackKnight: { glyph: "♞", tone: "black", label: "Black knight" },
  blackPawn: { glyph: "♟", tone: "black", label: "Black pawn" },
} as const;

const scenarios: Scenario[] = [
  {
    id: "opening",
    label: "Opening Vision",
    title: "Learn why central control matters from move one",
    summary: "Students build pattern memory through visual setups instead of memorizing lines blindly.",
    move: "1. e4",
    squares: ["e4", "e5", "d4", "f3"],
    board: {
      e1: pieces.whiteKing,
      d1: pieces.whiteQueen,
      a1: pieces.whiteRook,
      h1: pieces.whiteRook,
      c1: pieces.whiteBishop,
      f1: pieces.whiteBishop,
      f3: pieces.whiteKnight,
      b1: pieces.whiteKnight,
      e4: pieces.whitePawn,
      d2: pieces.whitePawn,
      c2: pieces.whitePawn,
      f2: pieces.whitePawn,
      g2: pieces.whitePawn,
      h2: pieces.whitePawn,
      e8: pieces.blackKing,
      d8: pieces.blackQueen,
      a8: pieces.blackRook,
      h8: pieces.blackRook,
      c8: pieces.blackBishop,
      f8: pieces.blackBishop,
      c6: pieces.blackKnight,
      g8: pieces.blackKnight,
      e5: pieces.blackPawn,
      d7: pieces.blackPawn,
      c7: pieces.blackPawn,
      f7: pieces.blackPawn,
      g7: pieces.blackPawn,
      h7: pieces.blackPawn,
    },
  },
  {
    id: "tactics",
    label: "Tactical Alertness",
    title: "Train children to see threats before they appear on the board",
    summary: "Tactical rehearsal turns panic into calm pattern recognition during real games.",
    move: "Knight fork on e7",
    squares: ["f5", "e7", "d6", "g7"],
    board: {
      g1: pieces.whiteKing,
      d1: pieces.whiteQueen,
      a1: pieces.whiteRook,
      f1: pieces.whiteRook,
      c4: pieces.whiteBishop,
      g2: pieces.whiteBishop,
      f5: pieces.whiteKnight,
      c3: pieces.whiteKnight,
      a2: pieces.whitePawn,
      b2: pieces.whitePawn,
      e4: pieces.whitePawn,
      f2: pieces.whitePawn,
      g3: pieces.whitePawn,
      h2: pieces.whitePawn,
      g8: pieces.blackKing,
      d8: pieces.blackQueen,
      a8: pieces.blackRook,
      f8: pieces.blackRook,
      c8: pieces.blackBishop,
      g7: pieces.blackBishop,
      c6: pieces.blackKnight,
      e7: pieces.blackPawn,
      a7: pieces.blackPawn,
      b7: pieces.blackPawn,
      d6: pieces.blackPawn,
      f7: pieces.blackPawn,
      h7: pieces.blackPawn,
    },
  },
  {
    id: "endgame",
    label: "Endgame Composure",
    title: "Teach precision when every move matters",
    summary: "Endgame training builds patience, conversion technique, and confidence under pressure.",
    move: "Opposition on e5",
    squares: ["e4", "e5", "d5", "f5"],
    board: {
      g2: pieces.whiteKing,
      e4: pieces.whitePawn,
      h3: pieces.whitePawn,
      a2: pieces.whitePawn,
      f6: pieces.blackKing,
      e6: pieces.blackPawn,
      h6: pieces.blackPawn,
      b7: pieces.blackPawn,
    },
  },
];

const contact = {
  phone: "88079 47108",
  whatsapp: "918807947108",
  address: "I-134, SBIOA Unity Enclave, Mambakkam, Chennai, Tamil Nadu 600127",
};

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 17) % 100}%`,
  top: `${(index * 29) % 100}%`,
  delay: index * 0.37,
  size: 3 + (index % 4),
}));

const floatingPieces = [
  { glyph: "♞", className: "left-[5%] top-[18%]", delay: 0 },
  { glyph: "♛", className: "right-[7%] top-[16%]", delay: 0.7 },
  { glyph: "♜", className: "left-[12%] bottom-[10%]", delay: 1.4 },
  { glyph: "♝", className: "right-[16%] bottom-[18%]", delay: 2.1 },
];

const spring = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 } as const;

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }} transition={spring}>
      {children}
    </motion.div>
  );
}

function CursorGlow({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="pointer-events-none fixed z-50 hidden h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.22),rgba(37,99,235,0.1)_38%,transparent_70%)] blur-xl lg:block"
      animate={{ left: x, top: y }}
      transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.25 }}
    />
  );
}

function AmbientBackground({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(245,158,11,0.22),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(37,99,235,0.16),transparent_24%),linear-gradient(180deg,#090806_0%,#16110d_44%,#070604_100%)]" />
      <motion.div
        className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(45deg,rgba(255,255,255,0.9)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.9)_75%),linear-gradient(45deg,rgba(255,255,255,0.9)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.9)_75%)] [background-position:0_0,28px_28px] [background-size:56px_56px]"
        animate={reduceMotion ? undefined : { backgroundPosition: ["0px 0px, 28px 28px", "56px 56px, 84px 84px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="pointer-events-none fixed rounded-full bg-amber-200/35 shadow-[0_0_18px_rgba(245,158,11,0.55)]"
          style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          animate={reduceMotion ? undefined : { y: [-18, 24, -18], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: 7 + (particle.id % 5), repeat: Infinity, delay: particle.delay, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function FloatingPieces({ parallax, reduceMotion }: { parallax: { x: number; y: number }; reduceMotion: boolean | null }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.25rem]">
      {floatingPieces.map((piece, index) => (
        <motion.span
          key={piece.glyph}
          className={cx(
            "absolute hidden h-20 w-20 place-items-center rounded-2xl border border-amber-200/20 bg-white/[0.055] font-display text-5xl text-amber-100 shadow-[0_24px_60px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:grid",
            piece.className,
          )}
          animate={
            reduceMotion
              ? { x: parallax.x * (index + 1) * 0.12, y: parallax.y * (index + 1) * 0.12 }
              : { x: parallax.x * (index + 1) * 0.12, y: [parallax.y * 0.1 - 14, parallax.y * 0.1 + 16, parallax.y * 0.1 - 14], rotate: [-5, 6, -5] }
          }
          transition={reduceMotion ? spring : { duration: 5.4 + piece.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {piece.glyph}
        </motion.span>
      ))}
    </div>
  );
}

function PremiumSection({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <motion.section
      id={id}
      className={cx(
        "relative z-10 mx-auto mb-6 w-full max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:max-w-[1680px] sm:p-8",
        "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-200/45 before:to-transparent",
        className,
      )}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <motion.div className="max-w-3xl" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}>
      <motion.p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200" variants={reveal}>
        {eyebrow}
      </motion.p>
      <motion.h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl" variants={reveal}>
        {title}
      </motion.h2>
      {copy ? (
        <motion.p className="mt-5 max-w-2xl text-base leading-8 text-stone-300" variants={reveal}>
          {copy}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

function CtaButton({ href, children, kind = "primary", pulse = false }: { href: string; children: string; kind?: "primary" | "secondary"; pulse?: boolean }) {
  return (
    <motion.a
      className={cx(
        "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604]",
        kind === "primary"
          ? "bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-stone-950 shadow-[0_16px_42px_rgba(245,158,11,0.24)]"
          : "border border-white/12 bg-white/[0.045] text-white backdrop-blur-xl hover:border-amber-200/45",
      )}
      href={href}
      animate={pulse ? { boxShadow: ["0 16px 42px rgba(245,158,11,0.24)", "0 20px 68px rgba(245,158,11,0.48)", "0 16px 42px rgba(245,158,11,0.24)"] } : undefined}
      whileHover={{ y: -3, scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={pulse ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : spring}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </motion.a>
  );
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;
    let frame = 0;
    const total = 46;
    const timer = window.setInterval(() => {
      frame += 1;
      setCount(Math.round(value * (1 - Math.pow(1 - frame / total, 3))));
      if (frame >= total) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [reduceMotion, value]);

  const displayCount = reduceMotion ? value : count;

  return <>{displayCount.toLocaleString("en-IN")}{suffix}</>;
}

function BoardCell({ square, piece, highlighted, active, onSelect }: { square: string; piece?: Piece; highlighted: boolean; active: boolean; onSelect: (square: string) => void }) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const isDark = (file + rank) % 2 !== 0;
  const ariaLabel = piece ? `${square}: ${piece.label} on ${isDark ? "dark" : "light"} square` : `${square}: empty ${isDark ? "dark" : "light"} square`;

  return (
    <motion.button
      type="button"
      className={cx(
        "group relative grid min-h-9 place-items-center outline-none transition-colors sm:min-h-12",
        isDark ? "bg-[#5b4c40]" : "bg-[#d8c8ae]",
        active && "ring-2 ring-inset ring-blue-300",
      )}
      aria-label={ariaLabel}
      onMouseEnter={() => onSelect(square)}
      onFocus={() => onSelect(square)}
      onClick={() => onSelect(square)}
      whileHover={{ scale: 1.045, zIndex: 5 }}
      transition={spring}
    >
      {highlighted ? (
        <motion.span
          className="absolute inset-[12%] rounded-2xl border-2 border-amber-300 bg-amber-200/12 shadow-[0_0_24px_rgba(245,158,11,0.55)]"
          layoutId={`active-${square}`}
          transition={spring}
        />
      ) : null}
      <AnimatePresence mode="popLayout">
        {piece ? (
          <motion.span
            key={`${square}-${piece.glyph}`}
            className={cx(
              "relative z-10 text-2xl leading-none drop-shadow-[0_8px_10px_rgba(0,0,0,0.52)] transition-transform group-hover:scale-110 sm:text-3xl",
              piece.tone === "white" ? "text-[#fff8ea]" : "text-[#120e0a]",
            )}
            initial={{ opacity: 0, scale: 0.72, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86 }}
            transition={spring}
            aria-hidden="true"
          >
            {piece.glyph}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

export default function SooriyaLandingPage() {
  const [activeProgram, setActiveProgram] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scenarioAutoplay, setScenarioAutoplay] = useState(true);
  const [testimonialAutoplay, setTestimonialAutoplay] = useState(true);
  const [activeSquare, setActiveSquare] = useState("e4");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [cursor, setCursor] = useState({ x: -300, y: -300 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!scenarioAutoplay || reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveScenario((current) => {
        const next = (current + 1) % scenarios.length;
        setActiveSquare(scenarios[next].squares[0]);
        return next;
      });
    }, 9000);
    return () => window.clearInterval(timer);
  }, [reduceMotion, scenarioAutoplay]);

  useEffect(() => {
    if (!testimonialAutoplay || reduceMotion) return undefined;
    const timer = window.setInterval(() => setActiveTestimonial((current) => (current + 1) % testimonials.length), 5600);
    return () => window.clearInterval(timer);
  }, [reduceMotion, testimonialAutoplay]);

  const scenario = scenarios[activeScenario];
  const program = programs[activeProgram];
  const testimonial = testimonials[activeTestimonial];
  const selectedSquare = activeSquare || scenario.squares[0];

  const liveUpdate = useMemo(() => `${scenario.label}: ${scenario.title}. Focus move ${scenario.move}.`, [scenario]);
  const activeSquareCopy = useMemo(() => {
    if (scenario.squares.includes(selectedSquare)) {
      return `${selectedSquare} is one of the focus squares in this lesson. Students learn what this square controls and how it changes the plan.`;
    }
    const piece = scenario.board[selectedSquare];
    if (piece) return `${selectedSquare} holds the ${piece.label.toLowerCase()}. Hovering pieces helps students connect board coordinates with real plans.`;
    return `${selectedSquare} is currently empty. Empty squares still matter because strong players think about control, threats, and future routes.`;
  }, [selectedSquare, scenario]);

  const handleProgramKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (event.key === "Home") {
      setActiveProgram(0);
      return;
    }
    if (event.key === "End") {
      setActiveProgram(programs.length - 1);
      return;
    }
    setActiveProgram((index + (event.key === "ArrowRight" ? 1 : -1) + programs.length) % programs.length);
  };

  const resumeScenarioAutoplay = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setScenarioAutoplay(true);
  };

  const resumeTestimonialAutoplay = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setTestimonialAutoplay(true);
  };

  const handleTestimonialDrag = (_event: globalThis.MouseEvent | globalThis.TouchEvent | globalThis.PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 55) return;
    setTestimonialAutoplay(false);
    setActiveTestimonial((current) => (current + (info.offset.x < 0 ? 1 : -1) + testimonials.length) % testimonials.length);
  };

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    setCursor({ x: event.clientX, y: event.clientY });
    const rect = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: (event.clientX - rect.left - rect.width / 2) / 18,
      y: (event.clientY - rect.top - rect.height / 2) / 18,
    });
  };

  const handleDemoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDemoSubmitted(true);
  };

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-[#070604] px-3 py-4 text-stone-50 sm:px-5 xl:px-8" onMouseMove={handleMouseMove}>
      <AmbientBackground reduceMotion={reduceMotion} />
      <CursorGlow x={cursor.x} y={cursor.y} />
      <motion.div
        className="pointer-events-none fixed left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/20 via-white/10 to-yellow-600/20 blur-3xl"
        animate={reduceMotion ? undefined : { x: [-34, 34, -34], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <PremiumSection className="p-4 sm:p-6 xl:p-8">
        <FloatingPieces parallax={parallax} reduceMotion={reduceMotion} />
        <motion.a
          href="#tournament"
          className="relative z-20 mb-4 flex min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-r from-amber-300/18 via-white/[0.06] to-blue-400/12 px-4 py-3 text-sm text-stone-100 shadow-[0_18px_60px_rgba(245,158,11,0.12)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-5"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, borderColor: "rgba(253,230,138,0.5)" }}
          transition={spring}
        >
          <motion.span
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-amber-100/18 to-transparent"
            animate={reduceMotion ? undefined : { x: ["-120%", "360%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="w-fit rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-stone-950">Live Notice</span>
            <strong className="break-words text-white">{internationalTournament.shortTitle}</strong>
            <span className="max-w-full break-words text-stone-300">{internationalTournament.dates} · {internationalTournament.prize} prize fund · Chengalpattu</span>
          </span>
          <span className="relative font-semibold text-amber-100">Register / details →</span>
        </motion.a>
        <header className="relative z-10 flex min-w-0 flex-col gap-5 border-b border-white/10 px-2 pb-5 pt-1 lg:flex-row lg:items-center lg:justify-between">
          <motion.div className="min-w-0" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
            <p className="font-display text-3xl leading-none text-white sm:text-4xl lg:text-5xl">Sooriya Chess Academy</p>
            <p className="mt-2 max-w-full text-sm uppercase tracking-[0.14em] text-amber-200 sm:tracking-[0.22em]">Chennai + online chess coaching for young competitors</p>
          </motion.div>
          <nav className="grid min-w-0 grid-cols-2 gap-3 text-sm text-stone-300 sm:flex sm:flex-wrap sm:items-center" aria-label="Primary navigation">
            {["Tournament", "Programs", "Training Flow", "Stories", "Contact"].map((item) => (
              <motion.a
                key={item}
                className="rounded-full px-3 py-2 text-center transition-colors hover:bg-white/7 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
                href={`#${item === "Training Flow" ? "training" : item.toLowerCase()}`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
              >
                {item}
              </motion.a>
            ))}
            <CtaButton href="#demo">Book Demo</CtaButton>
          </nav>
        </header>

        <div className="relative z-10 grid min-w-0 gap-8 pt-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:pt-8 2xl:grid-cols-[0.78fr_1.22fr]">
          <motion.div className="min-w-0 self-center" variants={stagger} initial="hidden" animate="visible">
            <motion.p className="max-w-full break-words text-xs font-semibold uppercase tracking-[0.1em] text-amber-200 sm:tracking-[0.28em]" variants={reveal}>
              Live lessons. Tournament thinking. Parent-trusted progress.
            </motion.p>
            <motion.h1 className="mt-5 max-w-5xl font-display text-5xl leading-[0.9] tracking-tight text-white sm:text-6xl xl:text-7xl 2xl:text-8xl" variants={reveal}>
              Chess coaching that feels like a live masterclass.
            </motion.h1>
            <motion.p className="mt-5 max-w-2xl break-words text-base leading-7 text-stone-300 xl:text-lg xl:leading-8" variants={reveal}>
              Sooriya Chess Academy turns each class into a guided board experience: animated ideas, clear plans, Chennai-based mentoring, online access, and tournament-aware training for children who are ready to think deeper.
            </motion.p>
            <motion.div className="mt-6 flex flex-wrap gap-3" variants={reveal}>
              <CtaButton href="#demo" pulse>Book Free Demo Class</CtaButton>
              <CtaButton href="#tournament" kind="secondary">View Tournament</CtaButton>
              <CtaButton
                href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20want%20to%20book%20a%20free%20demo%20class%20for%20my%20child.`}
                kind="secondary"
              >
                Chat on WhatsApp
              </CtaButton>
            </motion.div>
            <motion.div className="mt-6 flex flex-wrap gap-3" variants={stagger}>
              {trustPills.map((pill) => (
                <motion.span
                  key={pill}
                  className="max-w-full rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-stone-200 backdrop-blur-xl"
                  variants={reveal}
                  whileHover={{ y: -2, borderColor: "rgba(253,230,138,0.45)" }}
                  transition={spring}
                >
                  {pill}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative min-w-0 w-full"
            onMouseEnter={() => setScenarioAutoplay(false)}
            onMouseLeave={() => setScenarioAutoplay(true)}
            onFocusCapture={() => setScenarioAutoplay(false)}
            onBlurCapture={resumeScenarioAutoplay}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring, delay: 0.16 }}
          >
            <div className="mb-3 flex min-w-0 flex-wrap gap-2">
              {scenarios.map((item, index) => (
                <motion.button
                  key={item.id}
                  className={cx(
                    "rounded-full border px-4 py-2 text-sm outline-none backdrop-blur-xl transition-colors focus-visible:ring-2 focus-visible:ring-amber-200",
                    index === activeScenario
                      ? "border-amber-200/50 bg-amber-300/15 text-white"
                      : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:text-white",
                  )}
                  type="button"
                  onClick={() => {
                    setScenarioAutoplay(false);
                    setActiveScenario(index);
                    setActiveSquare(item.squares[0]);
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            <motion.div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-5 xl:p-6" layout>
              <div className="mb-5 grid min-w-0 gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Live board lesson</p>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-white sm:text-3xl 2xl:text-4xl">{scenario.title}</h3>
                </div>
                <motion.span className="h-fit rounded-full bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100" layout>
                  {scenario.move}
                </motion.span>
              </div>

              <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(560px,1fr)_minmax(280px,0.46fr)]">
                <motion.div
                  className="min-w-0 rounded-[1.1rem] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.24),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.2),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_26px_80px_rgba(0,0,0,0.36)] sm:p-4"
                  animate={reduceMotion ? undefined : { rotateX: parallax.y * -0.08, rotateY: parallax.x * 0.08 }}
                  transition={spring}
                >
                  <div className="grid gap-2 text-center text-[0.68rem] uppercase tracking-[0.18em] text-stone-300">
                    <div className="grid grid-cols-8">{files.map((file) => <span key={`top-${file}`}>{file}</span>)}</div>
                    <div className="grid grid-cols-[16px_1fr_16px] items-stretch gap-2 sm:grid-cols-[20px_1fr_20px]">
                      <div className="grid grid-rows-8">{ranks.map((rank) => <span key={`left-${rank}`}>{rank}</span>)}</div>
                      <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-[1rem] border border-white/15" role="img" aria-label="Interactive chess position preview">
                        {ranks.flatMap((rank) =>
                          files.map((file) => {
                            const square = `${file}${rank}`;
                            return (
                              <BoardCell
                                key={square}
                                square={square}
                                piece={scenario.board[square]}
                                highlighted={scenario.squares.includes(square)}
                                active={selectedSquare === square}
                                onSelect={setActiveSquare}
                              />
                            );
                          }),
                        )}
                      </div>
                      <div className="grid grid-rows-8">{ranks.map((rank) => <span key={`right-${rank}`}>{rank}</span>)}</div>
                    </div>
                    <div className="grid grid-cols-8">{files.map((file) => <span key={`bottom-${file}`}>{file}</span>)}</div>
                  </div>
                </motion.div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  <Magnetic>
                    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Move explanation</p>
                      <AnimatePresence mode="wait">
                        <motion.p key={`${scenario.id}-${selectedSquare}`} className="mt-3 leading-7 text-stone-300" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                          {activeSquareCopy}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </Magnetic>
                  <Magnetic>
                    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Board language</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {scenario.squares.map((square) => (
                          <motion.span key={square} className="rounded-full bg-amber-300/12 px-3 py-1.5 text-sm text-amber-100" layout>
                            {square}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </Magnetic>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">{liveUpdate}</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          {stats.map((stat) => (
            <motion.article key={stat.value} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl" variants={reveal} whileHover={{ y: -5, borderColor: "rgba(253,230,138,0.35)" }} transition={spring}>
              <strong className="block text-lg text-white">{stat.value}</strong>
              <span className="mt-3 block leading-7 text-stone-300">{stat.label}</span>
            </motion.article>
          ))}
        </motion.div>

        <motion.div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
          {trustMetrics.map((metric, index) => (
            <motion.article
              key={metric.label}
              className="group relative overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-b from-amber-200/10 to-white/[0.035] p-5 backdrop-blur-xl"
              variants={reveal}
              whileHover={{ y: -6, rotate: index % 2 ? -0.7 : 0.7, borderColor: "rgba(253,230,138,0.42)" }}
              transition={spring}
            >
              <motion.span className="absolute -right-5 -top-7 font-display text-8xl text-amber-200/10" animate={reduceMotion ? undefined : { rotate: [-4, 5, -4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                ♕
              </motion.span>
              <strong className="relative block font-display text-4xl text-white">
                <CountUp value={metric.value} suffix={metric.suffix} />
              </strong>
              <span className="relative mt-2 block text-stone-300">{metric.label}</span>
            </motion.article>
          ))}
        </motion.div>
      </PremiumSection>

      <PremiumSection id="tournament" className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <SectionHeader
            eyebrow="International Tournament"
            title="Sooriya is hosting a five-day FIDE-rated classical event"
            copy="Add the academy's organizer credibility directly into the site: a serious over-the-board tournament with FIDE rating, a classical time control, and a published multi-day schedule in Kelambakkam."
          />
          <motion.div className="mt-8 grid gap-3 sm:grid-cols-2" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {tournamentHighlights.map((item) => (
              <motion.article
                key={item.label}
                className="relative overflow-hidden rounded-3xl border border-amber-200/15 bg-amber-200/10 p-5 backdrop-blur-xl"
                variants={reveal}
                whileHover={{ y: -5, borderColor: "rgba(253,230,138,0.42)" }}
                transition={spring}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">{item.label}</p>
                <strong className="mt-3 block font-display text-3xl leading-tight text-white">{item.value}</strong>
              </motion.article>
            ))}
          </motion.div>
          <motion.div className="mt-6 flex flex-wrap gap-3" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <CtaButton href={internationalTournament.registration}>Register Online</CtaButton>
            <CtaButton href={internationalTournament.chessResults} kind="secondary">View Chess-Results</CtaButton>
          </motion.div>
        </div>

        <motion.div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.035] p-6 backdrop-blur-2xl" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
          <motion.span className="absolute -right-8 -top-10 font-display text-9xl text-amber-200/10" animate={reduceMotion ? undefined : { y: [-8, 10, -8], rotate: [-3, 4, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            ♛
          </motion.span>
          <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">{internationalTournament.eventId}</p>
          <h3 className="relative mt-4 font-display text-4xl leading-tight text-white">{internationalTournament.shortTitle}</h3>
          <div className="relative mt-5 grid gap-3 text-stone-300">
            <p><span className="font-semibold text-white">Venue:</span> {internationalTournament.venue}, {internationalTournament.city}</p>
            <p><span className="font-semibold text-white">Format:</span> {internationalTournament.rating}, {internationalTournament.format}</p>
            <p><span className="font-semibold text-white">Time control:</span> {internationalTournament.timeControl}</p>
            <p><span className="font-semibold text-white">Deadline:</span> {internationalTournament.deadline}</p>
            <p><span className="font-semibold text-white">Tournament contacts:</span> {internationalTournament.contacts}</p>
          </div>
          <div className="relative mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Published schedule</p>
            <motion.ul className="mt-4 grid gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {tournamentSchedule.map(([date, detail]) => (
                <motion.li key={date} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-stone-200 sm:grid-cols-[82px_1fr]" variants={reveal}>
                  <span className="font-semibold text-amber-100">{date}</span>
                  <span>{detail}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {["AICF ID for Indian players", "TNSCA ID for Tamil Nadu players", "Valid FIDE ID for foreign players", "Canteen + parking available"].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm text-stone-200">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </PremiumSection>

      <PremiumSection>
        <SectionHeader
          eyebrow="Positioning"
          title="A chess website that feels intentional, premium, and alive"
          copy="The visual system follows a high-contrast editorial direction with chessboard textures, gold accents, and deliberate interactions rather than generic education-site patterns."
        />
        <motion.div className="mt-8 grid gap-4 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {highlights.map((item) => (
            <motion.article key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl" variants={reveal} whileHover={{ y: -6 }} transition={spring}>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 leading-7 text-stone-300">{item.copy}</p>
            </motion.article>
          ))}
        </motion.div>
      </PremiumSection>

      <PremiumSection id="programs">
        <SectionHeader
          eyebrow="Programs"
          title="Four tracks that move students from first moves to tournament mindset"
          copy="Parents can compare the progression instantly, then drill into the batch that fits their child’s stage."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="grid gap-3" role="tablist" aria-label="Program options">
            {programs.map((item, index) => (
              <motion.button
                key={item.title}
                id={`program-tab-${index}`}
                type="button"
                role="tab"
                tabIndex={index === activeProgram ? 0 : -1}
                aria-selected={index === activeProgram}
                aria-controls={`program-panel-${index}`}
                className={cx(
                  "group relative overflow-hidden rounded-3xl border p-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-amber-200",
                  "before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-amber-100/12 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-full",
                  index === activeProgram ? "border-amber-200/45 bg-amber-300/12 shadow-[0_20px_60px_rgba(245,158,11,0.12)]" : "border-white/10 bg-white/[0.04] hover:border-white/20",
                )}
                onClick={() => setActiveProgram(index)}
                onKeyDown={(event) => handleProgramKeyDown(event, index)}
                whileHover={{ x: 4, rotateY: 4, rotateX: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={spring}
              >
                <span className="absolute right-4 top-3 font-display text-5xl text-amber-200/12 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  {["♙", "♘", "♕", "♜"][index]}
                </span>
                <span className="relative block text-white">{item.title}</span>
                <small className="relative mt-1 block text-stone-400">{item.duration}</small>
                <span className="relative mt-3 block max-h-0 overflow-hidden text-sm leading-6 text-stone-300 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                  {item.outcomes[0]}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.article className="rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-6 backdrop-blur-2xl" id={`program-panel-${activeProgram}`} role="tabpanel" aria-labelledby={`program-tab-${activeProgram}`} layout>
            <AnimatePresence mode="wait">
              <motion.div key={program.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Ideal for</p>
                <h3 className="mt-3 font-display text-4xl leading-tight text-white">{program.title}</h3>
                <p className="mt-3 max-w-xl leading-7 text-stone-300">{program.idealFor}</p>
                <ul className="my-7 grid gap-3">
                  {program.outcomes.map((outcome) => (
                    <motion.li key={outcome} className="flex gap-3 leading-7 text-stone-200" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={spring}>
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.75)]" />
                      {outcome}
                    </motion.li>
                  ))}
                </ul>
                <CtaButton href="#demo">{program.cta}</CtaButton>
              </motion.div>
            </AnimatePresence>
          </motion.article>
        </div>
      </PremiumSection>

      <PremiumSection id="training" className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <SectionHeader
            eyebrow="Training Flow"
            title="A weekly rhythm children can follow and parents can trust"
            copy="The academy experience is shown like a coaching system, not a vague promise. That clarity is important for conversion."
          />
          <motion.div className="mt-8 grid gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {trainingFlow.map((step) => (
              <motion.article key={step.week} className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl sm:grid-cols-[64px_1fr]" variants={reveal} whileHover={{ x: 5 }} transition={spring}>
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-300/12 text-lg font-semibold text-amber-100">{step.week}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 leading-7 text-stone-300">{step.detail}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
        <motion.aside className="relative h-fit overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
          <motion.span className="absolute -right-8 -top-10 font-display text-9xl text-amber-200/10" animate={reduceMotion ? undefined : { y: [-8, 10, -8], rotate: [-3, 4, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            ♔
          </motion.span>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Trust signals</p>
          <h3 className="mt-4 font-display text-4xl leading-tight text-white">Public activity adds credibility to the coaching promise.</h3>
          <motion.ul className="relative mt-7 grid gap-4 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-gradient-to-b before:from-amber-200 before:via-blue-300/50 before:to-transparent" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {achievements.map((item, index) => (
              <motion.li key={item} className="relative flex gap-3 leading-7 text-stone-200" variants={reveal} whileHover={{ x: 5 }} transition={spring}>
                <motion.span className="mt-2 h-3 w-3 shrink-0 rounded-full bg-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.75)]" animate={reduceMotion ? undefined : { scale: [1, 1.35, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.3 }} />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.aside>
      </PremiumSection>

      <PremiumSection id="stories">
        <SectionHeader
          eyebrow="Stories"
          title="Parent confidence and student momentum"
          copy="The testimonial area rotates automatically, but remains manually navigable so the motion feels useful rather than distracting."
        />
        <div className="mt-8" onMouseEnter={() => setTestimonialAutoplay(false)} onMouseLeave={() => setTestimonialAutoplay(true)} onFocusCapture={() => setTestimonialAutoplay(false)} onBlurCapture={resumeTestimonialAutoplay}>
          <motion.article
            className="min-h-72 cursor-grab rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-6 backdrop-blur-2xl active:cursor-grabbing"
            layout
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={handleTestimonialDrag}
            whileHover={{ borderColor: "rgba(253,230,138,0.28)" }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={testimonial.author} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={spring}>
                <p className="font-display text-7xl leading-none text-amber-300/50">“</p>
                <p className="max-w-3xl text-xl leading-9 text-stone-100">{testimonial.quote}</p>
                <div className="mt-7">
                  <strong className="text-white">{testimonial.author}</strong>
                  <span className="mt-1 block text-stone-400">{testimonial.role}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.article>
          <div className="mt-5 flex gap-2" aria-label="Testimonial controls">
            {testimonials.map((item, index) => (
              <motion.button
                key={item.author}
                type="button"
                className={cx("h-3 rounded-full border border-white/20 outline-none focus-visible:ring-2 focus-visible:ring-amber-200", index === activeTestimonial ? "w-9 bg-amber-300" : "w-3 bg-transparent")}
                onClick={() => {
                  setTestimonialAutoplay(false);
                  setActiveTestimonial(index);
                }}
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={index === activeTestimonial}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
              />
            ))}
          </div>
        </div>
      </PremiumSection>

      <PremiumSection className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionHeader eyebrow="FAQ" title="Common questions from parents deciding where to enroll" />
          <div className="mt-8 grid gap-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.article key={item.q} className="rounded-3xl border border-white/10 bg-white/[0.045] px-5 backdrop-blur-xl" layout>
                  <motion.button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    aria-controls={`faq-panel-${index}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{item.q}</span>
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={spring} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/7 text-xl">
                      +
                    </motion.span>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.p id={`faq-panel-${index}`} className="pb-5 leading-7 text-stone-300" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring}>
                        {item.a}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>

        <motion.div id="demo" className="rounded-[1.5rem] border border-amber-200/20 bg-gradient-to-b from-amber-200/12 to-white/[0.035] p-6 shadow-[0_22px_70px_rgba(245,158,11,0.14)] backdrop-blur-2xl" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Book a demo</p>
          <h3 className="mt-4 font-display text-4xl leading-tight text-white">Start with one clear next step.</h3>
          <p className="mt-4 leading-7 text-stone-300">This page is built around the strongest conversion action for a parent-led decision: a free demo class before enrollment.</p>
          <form className="mt-6 grid gap-3" onSubmit={handleDemoSubmit}>
            {["Parent name", "Child age", "Preferred batch"].map((label) => (
              <label key={label} className="grid gap-2 text-sm text-stone-300">
                {label}
                <motion.input className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition-colors placeholder:text-stone-500 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20" placeholder={label} whileFocus={{ scale: 1.015, borderColor: "rgba(253,230,138,0.55)" }} transition={spring} />
              </label>
            ))}
            <label className="grid gap-2 text-sm text-stone-300">
              Message
              <motion.textarea className="min-h-28 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition-colors placeholder:text-stone-500 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20" placeholder="Tell us your child's current chess level" whileFocus={{ scale: 1.015, borderColor: "rgba(253,230,138,0.55)" }} transition={spring} />
            </label>
            <div className="mt-3 flex flex-wrap gap-3">
              <motion.button
                type="submit"
                className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-5 text-sm font-semibold text-stone-950 outline-none shadow-[0_16px_42px_rgba(245,158,11,0.24)] focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070604]"
                whileHover={{ y: -3, scale: 1.035 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 16px 42px rgba(245,158,11,0.24)", "0 20px 68px rgba(245,158,11,0.48)", "0 16px 42px rgba(245,158,11,0.24)"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Book Free Demo</span>
              </motion.button>
              <CtaButton href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20would%20like%20to%20schedule%20a%20demo%20class.`} kind="secondary">
                Request on WhatsApp
              </CtaButton>
            </div>
            <AnimatePresence>
              {demoSubmitted ? (
                <motion.div
                  className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={spring}
                >
                  Demo request noted. For fastest confirmation, tap WhatsApp and send the pre-filled message.
                </motion.div>
              ) : null}
            </AnimatePresence>
          </form>
          <div className="mt-6 grid gap-2 text-stone-300">
            <a className="text-white transition-colors hover:text-amber-100" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
            <a className="text-white transition-colors hover:text-amber-100" href={`https://wa.me/${contact.whatsapp}`}>WhatsApp the academy</a>
            <p>{contact.address}</p>
          </div>
        </motion.div>
      </PremiumSection>

      <motion.footer id="contact" className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-5 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Sooriya Chess Academy</p>
          <p className="mt-2 text-sm text-stone-300">Chennai-based coaching with online access and tournament-focused growth.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-stone-300">
          <a className="hover:text-white" href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
          <a className="hover:text-white" href={`https://wa.me/${contact.whatsapp}`}>WhatsApp</a>
          <a className="hover:text-white" href="#programs">Programs</a>
        </div>
      </motion.footer>

      <motion.a
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-emerald-200/30 bg-emerald-400 text-xl text-stone-950 shadow-[0_16px_48px_rgba(16,185,129,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 sm:h-16 sm:w-16"
        href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20want%20to%20book%20a%20free%20demo%20class.`}
        aria-label="Chat with Sooriya Chess Academy on WhatsApp"
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0, boxShadow: ["0 16px 48px rgba(16,185,129,0.35)", "0 18px 70px rgba(16,185,129,0.58)", "0 16px 48px rgba(16,185,129,0.35)"] }}
        whileHover={{ scale: 1.08, y: -3 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ☎
      </motion.a>
    </main>
  );
}
