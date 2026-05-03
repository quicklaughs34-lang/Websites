"use client";

import { motion, type Variants } from "framer-motion";
import { Award, BookOpenCheck, CalendarCheck, ChevronRight, Medal, MessageCircle, ShieldCheck, Sparkles, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const contact = {
  phone: "88079 47108",
  whatsapp: "918807947108",
  address: "I-134, SBIOA Unity Enclave, Mambakkam, Chennai, Tamil Nadu 600127",
};

const pageData = {
  courses: {
    eyebrow: "Courses",
    title: "Chess programs built for the next clear level",
    copy: "Every track is designed to make progress visible for parents and exciting for students, from first moves to tournament preparation.",
    cards: [
      ["Beginner Foundation", "Piece movement, board vision, notation, checkmate patterns, and confident full-game play.", "12 weeks"],
      ["Intermediate Strategy", "Tactics, openings with purpose, calculation habits, and blunder reduction.", "16 weeks"],
      ["Advanced Competitive Play", "Deeper calculation, positional planning, endgames, clock discipline, and annotated game review.", "24 weeks"],
      ["Tournament Preparation", "Practice games, rating goals, pressure training, event planning, and post-game analysis.", "8 weeks+"],
    ],
    timeline: [
      "Level check and parent goal mapping",
      "Personalized batch recommendation",
      "Weekly tactical and strategic training",
      "Practice games with coach feedback",
      "Progress review and tournament readiness plan",
    ],
  },
  about: {
    eyebrow: "About",
    title: "Coaching children to think, not memorize",
    copy: "Sooriya Chess Academy blends disciplined chess training with a child-friendly learning environment for Chennai families and online students.",
    cards: [
      ["Coach-led clarity", "Students learn why a move works before they are asked to remember it.", "8+ years"],
      ["Parent visibility", "Clear progress markers help parents understand what their child is building.", "Weekly"],
      ["Competitive pathway", "Training is shaped around school events, rated events, and stronger decision-making.", "Active"],
    ],
    timeline: [
      "Foundation lessons that make rules and notation simple",
      "Pattern recognition through puzzles and guided games",
      "Game review routines that build self-correction",
      "Tournament habits for focus, time control, and resilience",
    ],
  },
  achievements: {
    eyebrow: "Achievements",
    title: "Trust built through visible student progress",
    copy: "The academy story is presented around consistency, tournament activity, and measurable training outcomes.",
    cards: [
      ["500+ Students Trained", "Young learners coached across beginner, intermediate, and competitive batches.", "Students"],
      ["80+ Tournament Medals", "Achievement cards can be updated as students win school, district, and open events.", "Medals"],
      ["25+ Rated Player Pathway", "Advanced students are guided toward stronger tournament routines and rating goals.", "Rated"],
    ],
    timeline: [
      "Students completed first tournament-ready curriculum",
      "Children represented schools in competitive events",
      "Advanced students improved through annotated game review",
      "Weekend practice squads launched for serious players",
    ],
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "Parent confidence and student momentum",
    copy: "Social proof is designed to answer the questions parents actually have: focus, confidence, structure, and visible improvement.",
    cards: [
      ["Lakshmi R.", "My son became calmer and more focused after joining. The classes are structured and the coach explains beautifully.", "Parent"],
      ["Sathish K.", "Tournament preparation helped my daughter play with confidence instead of fear.", "Parent"],
      ["Aadhya, age 10", "I learned openings, forks, and how to stay calm when I am losing.", "Student"],
    ],
    timeline: [
      "Focus improved through puzzle routines",
      "Students gained confidence in school competitions",
      "Parents saw clearer practice habits at home",
      "Beginners started playing full games with purpose",
    ],
  },
  contact: {
    eyebrow: "Book Demo",
    title: "Start with a free demo class",
    copy: "Share a few details and connect directly with the academy through WhatsApp or phone.",
    cards: [
      ["Online Classes", "Learn from home with structured coaching and guided practice.", "Flexible"],
      ["Offline Coaching", contact.address, "Chennai"],
      ["Fast WhatsApp Response", "Use the floating WhatsApp CTA or the booking button to start.", "Direct"],
    ],
    timeline: [
      "Parent shares student age and current level",
      "Coach recommends the right batch",
      "Student attends a demo session",
      "Parent receives a clear learning path",
    ],
  },
} as const;

const icons = [BookOpenCheck, Trophy, Users, ShieldCheck];

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

function MagneticLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return (
    <motion.a
      href={href}
      className={
        secondary
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.045] px-5 text-sm font-semibold text-white backdrop-blur-xl"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 px-5 text-sm font-semibold text-stone-950 shadow-[0_16px_42px_rgba(245,158,11,0.24)]"
      }
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
    >
      {children}
      <ChevronRight size={16} />
    </motion.a>
  );
}

export default function SubPage({ kind }: { kind: keyof typeof pageData }) {
  const data = pageData[kind];

  return (
    <main className="min-h-screen overflow-hidden bg-[#070604] px-3 py-4 text-stone-50 sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(245,158,11,0.2),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(37,99,235,0.15),transparent_24%),linear-gradient(180deg,#100d0a_0%,#17130f_44%,#070604_100%)]" />

      <motion.header className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.045] px-5 py-4 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/" className="group">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">Sooriya Chess Academy</p>
          <p className="mt-2 text-sm text-stone-300 group-hover:text-white">Premium chess coaching for children</p>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-stone-300" aria-label="Primary navigation">
          {[
            ["Courses", "/courses"],
            ["Coaches", "/about"],
            ["Achievements", "/achievements"],
            ["Testimonials", "/testimonials"],
            ["Book Demo", "/contact"],
          ].map(([label, href]) => (
            <Link key={href} className="rounded-full px-3 py-2 transition-colors hover:bg-white/7 hover:text-white" href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </motion.header>

      <section className="relative z-10 mx-auto mt-6 grid max-w-7xl gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="self-center">
          <motion.p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200" variants={reveal}>
            {data.eyebrow}
          </motion.p>
          <motion.h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.9] tracking-tight text-white sm:text-7xl" variants={reveal}>
            {data.title}
          </motion.h1>
          <motion.p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300" variants={reveal}>
            {data.copy}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" variants={reveal}>
            <MagneticLink href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20want%20to%20book%20a%20free%20demo%20class.`}>
              Book Free Demo Class
            </MagneticLink>
            <MagneticLink href="/courses" secondary>
              Explore Courses
            </MagneticLink>
          </motion.div>
        </motion.div>

        <motion.div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-5" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.14 }}>
          <motion.div className="absolute inset-0 opacity-30 [background-image:linear-gradient(45deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.12)_75%),linear-gradient(45deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.12)_75%)] [background-position:0_0,24px_24px] [background-size:48px_48px]" animate={{ backgroundPosition: ["0px 0px, 24px 24px", "48px 48px, 72px 72px"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
          {["♛", "♞", "♜", "♚"].map((piece, index) => (
            <motion.span
              key={piece}
              className="absolute grid h-20 w-20 place-items-center rounded-2xl border border-amber-200/20 bg-white/[0.06] font-display text-5xl text-amber-100 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              style={{ left: `${12 + index * 20}%`, top: `${18 + (index % 2) * 36}%` }}
              animate={{ y: [-12, 14, -12], rotate: [-4, 5, -4] }}
              transition={{ duration: 5 + index, repeat: Infinity, ease: "easeInOut" }}
            >
              {piece}
            </motion.span>
          ))}
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#070604]/70 p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Conversion path</p>
            <p className="mt-3 leading-7 text-stone-200">Parents can book a demo, compare programs, and verify trust signals without leaving the flow.</p>
          </div>
        </motion.div>
      </section>

      <motion.section className="relative z-10 mx-auto mt-6 grid max-w-7xl gap-4 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        {data.cards.map(([title, copy, meta], index) => {
          const Icon = icons[index % icons.length];
          return (
            <motion.article key={title} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl" variants={reveal} whileHover={{ y: -8, rotateX: 2, borderColor: "rgba(253,230,138,0.38)" }}>
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-300/12 text-amber-100">
                  <Icon size={22} />
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-300">{meta}</span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white">{title}</h2>
              <p className="mt-4 leading-7 text-stone-300">{copy}</p>
            </motion.article>
          );
        })}
      </motion.section>

      <section className="relative z-10 mx-auto mt-6 grid max-w-7xl gap-6 rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">Progress System</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">A guided path from demo to measurable growth</h2>
          <p className="mt-5 leading-8 text-stone-300">The experience repeats the most important conversion promise: clear next steps, visible progress, and confident parent decisions.</p>
        </div>
        <motion.div className="grid gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {data.timeline.map((item, index) => (
            <motion.div key={item} className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[52px_1fr]" variants={reveal}>
              <span className="grid h-13 w-13 place-items-center rounded-2xl bg-amber-300/12 text-amber-100">{String(index + 1).padStart(2, "0")}</span>
              <p className="self-center leading-7 text-stone-200">{item}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {kind === "contact" ? (
        <section className="relative z-10 mx-auto mt-6 max-w-7xl rounded-[1.75rem] border border-amber-200/20 bg-gradient-to-b from-amber-200/12 to-white/[0.035] p-5 backdrop-blur-2xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">Lead Capture</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">Book your child’s free chess demo</h2>
              <p className="mt-5 leading-8 text-stone-300">The form is optimized for parent intent: age, level, mode, and a direct WhatsApp follow-up.</p>
            </div>
            <form className="grid gap-3">
              {["Parent name", "Phone number", "Student age", "Current level"].map((label) => (
                <label key={label} className="grid gap-2 text-sm text-stone-300">
                  {label}
                  <input className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition-colors placeholder:text-stone-500 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/20" placeholder={label} />
                </label>
              ))}
              <label className="grid gap-2 text-sm text-stone-300">
                Preferred mode
                <select className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-amber-200/50">
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Not sure yet</option>
                </select>
              </label>
              <div className="mt-3 flex flex-wrap gap-3">
                <MagneticLink href={`https://wa.me/${contact.whatsapp}?text=Hello%20Sooriya%20Chess%20Academy%2C%20I%20want%20to%20book%20a%20free%20demo%20class.`}>
                  Submit on WhatsApp
                </MagneticLink>
                <MagneticLink href={`tel:${contact.phone.replace(/\s+/g, "")}`} secondary>
                  Call Now
                </MagneticLink>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      <footer className="relative z-10 mx-auto mt-6 flex max-w-7xl flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-300">Sooriya Chess Academy. Chennai coaching with online access.</p>
        <div className="flex flex-wrap gap-4 text-sm text-stone-300">
          <a className="inline-flex items-center gap-2 hover:text-white" href={`https://wa.me/${contact.whatsapp}`}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a className="inline-flex items-center gap-2 hover:text-white" href="/contact">
            <CalendarCheck size={16} /> Book Demo
          </a>
        </div>
      </footer>
    </main>
  );
}
