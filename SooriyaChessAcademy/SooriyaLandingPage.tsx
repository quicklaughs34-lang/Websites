import { useEffect, useMemo, useState, type FocusEvent, type KeyboardEvent } from "react";

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
      "The page frames Sooriya as part of the competitive chess circuit, which gives parents a stronger trust signal than ordinary tuition-style messaging.",
  },
  {
    title: "Interactive storytelling instead of static brochure design",
    copy:
      "The interface reveals training scenarios, weekly progress, and program detail through interaction, so the site feels like a chess environment rather than a plain sales page.",
  },
  {
    title: "Premium without becoming cold",
    copy:
      "A black, stone, and gold palette keeps the brand serious, while rounded surfaces and guided copy keep it approachable for families and children.",
  },
];

const achievements = [
  "Listed as organizer for the 1st International FIDE Rated Open Chess Tournament scheduled in June 2026 at Padur, Kelambakkam.",
  "Listed as organizer for the 1st TN State Level Children and Open Chess Tournament 2025 in Chennai.",
  "Runs with both contact points and Chennai visibility, supporting parent trust and local discovery.",
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
    quote:
      "I like that classes are serious but not scary. I learned openings, forks, and how to stay calm when I am losing.",
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

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="section-copy">{copy}</p> : null}
    </div>
  );
}

function CtaButton({
  href,
  children,
  kind = "primary",
}: {
  href: string;
  children: string;
  kind?: "primary" | "secondary";
}) {
  return (
    <a className={`cta-button cta-button--${kind}`} href={href}>
      {children}
    </a>
  );
}

function BoardCell({
  square,
  piece,
  highlighted,
}: {
  square: string;
  piece?: Piece;
  highlighted: boolean;
}) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const isDark = (file + rank) % 2 !== 0;
  const squareTone = isDark ? "dark" : "light";
  const ariaLabel = piece ? `${square}: ${piece.label} on ${squareTone} square` : `${square}: empty ${squareTone} square`;

  return (
    <div
      className={`board-cell ${isDark ? "board-cell--dark" : "board-cell--light"} ${highlighted ? "board-cell--active" : ""}`}
      aria-label={ariaLabel}
    >
      <span className={`board-piece ${piece ? `board-piece--${piece.tone}` : ""}`} aria-hidden="true">
        {piece?.glyph ?? ""}
      </span>
    </div>
  );
}

export default function SooriyaLandingPage() {
  const [activeProgram, setActiveProgram] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scenarioAutoplay, setScenarioAutoplay] = useState(true);
  const [testimonialAutoplay, setTestimonialAutoplay] = useState(true);

  useEffect(() => {
    if (!scenarioAutoplay) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveScenario((current) => (current + 1) % scenarios.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [scenarioAutoplay]);

  useEffect(() => {
    if (!testimonialAutoplay) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [testimonialAutoplay]);

  const scenario = scenarios[activeScenario];
  const program = programs[activeProgram];
  const testimonial = testimonials[activeTestimonial];

  const liveUpdate = useMemo(
    () => `${scenario.label}: ${scenario.title}. Focus move ${scenario.move}.`,
    [scenario],
  );

  const handleProgramKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      setActiveProgram(0);
      return;
    }

    if (event.key === "End") {
      setActiveProgram(programs.length - 1);
      return;
    }

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + programs.length) % programs.length;
    setActiveProgram(nextIndex);
  };

  const resumeScenarioAutoplay = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setScenarioAutoplay(true);
    }
  };

  const resumeTestimonialAutoplay = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTestimonialAutoplay(true);
    }
  };

  return (
    <main className="site-shell">
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />

      <section className="hero-panel">
        <header className="topbar">
          <div>
            <p className="brand">Sooriya Chess Academy</p>
            <p className="brand-sub">Premium chess coaching for children in Chennai and beyond</p>
          </div>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#programs">Programs</a>
            <a href="#training">Training Flow</a>
            <a href="#stories">Stories</a>
            <a href="#contact">Contact</a>
            <CtaButton href="#demo">Book Demo</CtaButton>
          </nav>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">Interactive chess learning. Premium parent-facing presentation.</p>
            <h1>Build calm thinkers, sharper players, and confident tournament competitors.</h1>
            <p className="hero-text">
              Sooriya Chess Academy combines local Chennai coaching with online access, structured progression, and
              tournament-aware training so children do more than just learn the rules. They learn how to think.
            </p>

            <div className="hero-actions">
              <CtaButton href="#demo">Book Free Demo Class</CtaButton>
              <CtaButton
                href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20want%20to%20book%20a%20free%20demo%20class%20for%20my%20child.`}
                kind="secondary"
              >
                Chat on WhatsApp
              </CtaButton>
            </div>

            <div className="pill-row">
              {trustPills.map((pill) => (
                <span key={pill} className="pill">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div
            className="hero-visual"
            onMouseEnter={() => setScenarioAutoplay(false)}
            onMouseLeave={() => setScenarioAutoplay(true)}
            onFocusCapture={() => setScenarioAutoplay(false)}
            onBlurCapture={resumeScenarioAutoplay}
          >
            <div className="control-strip">
              {scenarios.map((item, index) => (
                <button
                  key={item.id}
                  className={index === activeScenario ? "control-pill control-pill--active" : "control-pill"}
                  type="button"
                  onClick={() => {
                    setScenarioAutoplay(false);
                    setActiveScenario(index);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="analysis-card">
              <div className="analysis-meta">
                <div>
                  <p className="label">Live board lesson</p>
                  <h3>{scenario.title}</h3>
                </div>
                <span className="move-chip">{scenario.move}</span>
              </div>

              <div className="board-layout">
                <div className="board-wrap">
                  <div className="board-frame" aria-live="polite">
                    <div className="board-files board-files--top" aria-hidden="true">
                      {files.map((file) => (
                        <span key={`top-${file}`}>{file}</span>
                      ))}
                    </div>
                    <div className="board-main">
                      <div className="board-ranks" aria-hidden="true">
                        {ranks.map((rank) => (
                          <span key={`left-${rank}`}>{rank}</span>
                        ))}
                      </div>
                      <div className="board-grid" role="img" aria-label="Interactive chess position preview">
                        {ranks.flatMap((rank) =>
                          files.map((file) => {
                            const square = `${file}${rank}`;
                            return (
                              <BoardCell
                                key={square}
                                square={square}
                                piece={scenario.board[square]}
                                highlighted={scenario.squares.includes(square)}
                              />
                            );
                          }),
                        )}
                      </div>
                      <div className="board-ranks board-ranks--right" aria-hidden="true">
                        {ranks.map((rank) => (
                          <span key={`right-${rank}`}>{rank}</span>
                        ))}
                      </div>
                    </div>
                    <div className="board-files board-files--bottom" aria-hidden="true">
                      {files.map((file) => (
                        <span key={`bottom-${file}`}>{file}</span>
                      ))}
                    </div>
                  </div>
                  <div className="board-legend" aria-hidden="true">
                    <span>
                      <i className="legend-swatch legend-swatch--white" /> White pieces
                    </span>
                    <span>
                      <i className="legend-swatch legend-swatch--black" /> Black pieces
                    </span>
                  </div>
                </div>

                <div className="board-sidebar">
                  <div className="sidebar-card">
                    <p className="label">What students learn</p>
                    <p>{scenario.summary}</p>
                  </div>
                  <div className="sidebar-card">
                    <p className="label">Board language</p>
                    <ul className="inline-list">
                      {scenario.squares.map((square) => (
                        <li key={square}>{square}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <p className="sr-only" aria-live="polite">
                {liveUpdate}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          {stats.map((stat) => (
            <article key={stat.value} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader
          eyebrow="Positioning"
          title="A chess website that feels intentional, premium, and alive"
          copy="The visual system follows a high-contrast editorial direction with chessboard textures, gold accents, and deliberate interactions rather than generic education-site patterns."
        />
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article key={item.title} className="highlight-card">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section" id="programs">
        <SectionHeader
          eyebrow="Programs"
          title="Four tracks that move students from first moves to tournament mindset"
          copy="Parents can compare the progression instantly, then drill into the batch that fits their child’s stage."
        />

        <div className="program-shell">
          <div className="program-tabs" role="tablist" aria-label="Program options">
            {programs.map((item, index) => (
              <button
                key={item.title}
                id={`program-tab-${index}`}
                type="button"
                role="tab"
                tabIndex={index === activeProgram ? 0 : -1}
                aria-selected={index === activeProgram}
                aria-controls={`program-panel-${index}`}
                className={index === activeProgram ? "program-tab program-tab--active" : "program-tab"}
                onClick={() => setActiveProgram(index)}
                onKeyDown={(event) => handleProgramKeyDown(event, index)}
              >
                <span>{item.title}</span>
                <small>{item.duration}</small>
              </button>
            ))}
          </div>

          <article
            className="program-panel"
            id={`program-panel-${activeProgram}`}
            role="tabpanel"
            aria-labelledby={`program-tab-${activeProgram}`}
          >
            <div>
              <p className="label">Ideal for</p>
              <h3>{program.title}</h3>
              <p className="program-ideal">{program.idealFor}</p>
            </div>
            <ul className="feature-list">
              {program.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
            <CtaButton href="#demo">{program.cta}</CtaButton>
          </article>
        </div>
      </section>

      <section className="content-section content-section--split" id="training">
        <div>
          <SectionHeader
            eyebrow="Training Flow"
            title="A weekly rhythm children can follow and parents can trust"
            copy="The academy experience is shown like a coaching system, not a vague promise. That clarity is important for conversion."
          />
          <div className="timeline">
            {trainingFlow.map((step) => (
              <article key={step.week} className="timeline-card">
                <span>{step.week}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="signal-panel">
          <p className="label">Trust signals</p>
          <h3>Public activity adds credibility to the coaching promise.</h3>
          <ul className="feature-list">
            {achievements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="content-section" id="stories">
        <SectionHeader
          eyebrow="Stories"
          title="Parent confidence and student momentum"
          copy="The testimonial area rotates automatically, but remains manually navigable so the motion feels useful rather than distracting."
        />
        <div
          className="testimonial-shell"
          onMouseEnter={() => setTestimonialAutoplay(false)}
          onMouseLeave={() => setTestimonialAutoplay(true)}
          onFocusCapture={() => setTestimonialAutoplay(false)}
          onBlurCapture={resumeTestimonialAutoplay}
        >
          <article className="testimonial-card">
            <p className="quote-mark">“</p>
            <p className="testimonial-quote">{testimonial.quote}</p>
            <div className="testimonial-meta">
              <strong>{testimonial.author}</strong>
              <span>{testimonial.role}</span>
            </div>
          </article>
          <div className="testimonial-controls" aria-label="Testimonial controls">
            {testimonials.map((item, index) => (
              <button
                key={item.author}
                type="button"
                className={index === activeTestimonial ? "dot dot--active" : "dot"}
                onClick={() => {
                  setTestimonialAutoplay(false);
                  setActiveTestimonial(index);
                }}
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={index === activeTestimonial}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section content-section--split">
        <div>
          <SectionHeader
            eyebrow="FAQ"
            title="Common questions from parents deciding where to enroll"
          />
          <div className="faq-list">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.q} className="faq-item">
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-controls={`faq-panel-${index}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>{item.q}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen ? (
                    <p className="faq-answer" id={`faq-panel-${index}`}>
                      {item.a}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className="demo-panel" id="demo">
          <p className="label">Book a demo</p>
          <h3>Start with one clear next step.</h3>
          <p>
            This page is built around the strongest conversion action for a parent-led decision: a free demo class
            before enrollment.
          </p>
          <div className="contact-stack">
            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
            <a href={`https://wa.me/${contact.whatsapp}`}>WhatsApp the academy</a>
            <p>{contact.address}</p>
          </div>
          <div className="hero-actions">
            <CtaButton href={`tel:${contact.phone.replace(/\s+/g, "")}`}>Call Now</CtaButton>
            <CtaButton
              href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20would%20like%20to%20schedule%20a%20demo%20class.`}
              kind="secondary"
            >
              Request on WhatsApp
            </CtaButton>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <p className="brand">Sooriya Chess Academy</p>
          <p className="brand-sub">Chennai-based coaching with online access and tournament-focused growth.</p>
        </div>
        <div className="footer-links">
          <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
          <a href={`https://wa.me/${contact.whatsapp}`}>WhatsApp</a>
          <a href="#programs">Programs</a>
        </div>
      </footer>
    </main>
  );
}
