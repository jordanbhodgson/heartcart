"use client";

import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

function useMouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }
  return { springX, springY, onMouseMove };
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 bg-[#08080f]/80 backdrop-blur-xl border-b border-white/5" : "py-5 bg-transparent"}`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.04 }}>
          <span className="text-xl font-black tracking-tight text-white">
            Heart<span className="ml-0" style={{ background: "linear-gradient(90deg, #e879f9, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cart</span>
          </span>
        </motion.div>

        <nav className="hidden sm:flex items-center gap-8">
          {["How it works", "Gifts"].map((item, i) => (
            <motion.a key={item} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-white/50 hover:text-white transition-colors duration-200">
              {item}
            </motion.a>
          ))}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <a href="#about" className="text-sm text-white/50 hover:text-white transition-colors duration-200">Family Dashboard</a>
          </motion.div>
        </nav>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3">
          <Link href="/order">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="text-sm font-semibold px-4 py-2 rounded-full text-black" style={{ background: "linear-gradient(135deg, #e879f9, #22d3ee)" }}>
              Send a gift
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}

function Orb({ color, size, x, y, delay = 0 }: { color: string; size: number; x: string; y: string; delay?: number }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.45}px)` }}
    />
  );
}

function AnimatedWord({ word, gradient }: { word: string; gradient?: boolean }) {
  return (
    <span className="inline-flex">
      {word.split("").map((letter, i) => (
        <motion.span
          key={i}
          variants={{ hidden: { opacity: 0, y: 48, rotateX: -40 }, show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.55, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] } } }}
          className="inline-block"
          style={gradient ? { background: "linear-gradient(135deg, #e879f9 0%, #818cf8 50%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : undefined}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}

function GlowCard({ children, glowColor = "#e879f9", className = "", delay = 0 }: { children: React.ReactNode; glowColor?: string; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { springX, springY, onMouseMove } = useMouseGlow();
  const [hovered, setHovered] = useState(false);
  const glowX = useTransform(springX, (v) => v - 100);
  const glowY = useTransform(springY, (v) => v - 100);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ delay }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl border border-white/8 backdrop-blur-sm cursor-default ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", boxShadow: hovered ? `0 0 40px 0 ${glowColor}33, inset 0 0 30px 0 ${glowColor}0a` : undefined, transition: "box-shadow 0.3s ease" }}
    >
      <motion.div className="absolute pointer-events-none" style={{ width: 200, height: 200, x: glowX, y: glowY, opacity: hovered ? 1 : 0, background: `radial-gradient(circle, ${glowColor}22 0%, transparent 70%)`, borderRadius: "50%", transition: "opacity 0.2s ease" }} />
      {children}
    </motion.div>
  );
}

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={`relative max-w-6xl mx-auto px-6 ${className}`}>{children}</section>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeIn} className="flex justify-center mb-4">
      <span className="text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border" style={{ color: "#e879f9", borderColor: "#e879f9", background: "#e879f920" }}>{children}</span>
    </motion.div>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <div ref={ref} className="relative min-h-screen flex flex-col justify-center pt-20 pb-10" style={{ clipPath: "none" }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Orb color="#e879f9" size={520} x="-5%" y="0%" delay={0} />
        <Orb color="#22d3ee" size={400} x="60%" y="10%" delay={2} />
        <Orb color="#818cf8" size={280} x="35%" y="60%" delay={4} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: text ── */}
          <motion.div style={{ y }} className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/60"
            >
              <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Delivering across the greater Palm Springs area
            </motion.div>

            <motion.h1 variants={stagger} initial="hidden" animate="show" className="text-5xl sm:text-7xl lg:text-7xl font-black tracking-tighter leading-[1.15] mb-6 pb-3 overflow-visible" style={{ perspective: 1000 }}>
              <span className="block text-white mb-2">
                <AnimatedWord word="Gifts" />{" "}<AnimatedWord word="of" />{" "}<AnimatedWord word="gratitude," gradient />
              </span>
              <span className="block">
                <AnimatedWord word="made" />{" "}
                <AnimatedWord word="easy." gradient />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-lg text-white/50 max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Soft fruit, flowers, comfort gifts — delivered directly to your loved ones in Palm Springs area nursing homes. Order in under 60 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/order">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative px-8 py-4 rounded-full text-base font-bold text-black overflow-hidden group"
                  style={{ background: "linear-gradient(135deg, #e879f9, #818cf8, #22d3ee)" }}
                >
                  <motion.span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #22d3ee, #818cf8, #e879f9)" }} />
                  <span className="relative">Send a gift now →</span>
                </motion.button>
              </Link>
              <a href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-full text-base font-semibold text-white/70 border border-white/10 hover:text-white transition-colors"
                >
                  See how it works
                </motion.button>
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: hero image ── */}
          <motion.div
            style={{ y: imgY }}
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="relative"
          >
            {/* Neon glow behind image */}
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, #e879f944 0%, #818cf822 50%, transparent 70%)",
                filter: "blur(24px)",
              }}
            />

            {/* Neon border ring */}
            <div
              className="absolute -inset-[3px] rounded-3xl pointer-events-none z-10"
              style={{
                background: "linear-gradient(135deg, #e879f966, #818cf844, #22d3ee66)",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "3px",
              }}
            />

            {/* Video */}
            <div className="relative rounded-3xl overflow-hidden aspect-video" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
              <video
                src="/hero-video.mp4"
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
              {/* Gradient blend at bottom */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, #08080f 0%, transparent-25%)" }} />
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-px h-12 rounded-full" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }} />
      </motion.div>
    </div>
  );
}

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="py-10 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"} className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[{ value: "1,000+", label: "Partner facilities" }, { value: "22k", label: "Curated gifts" }, { value: "2–4h", label: "Delivery window" }, { value: "60s", label: "To place an order" }].map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <p className="text-4xl sm:text-5xl font-black mb-1" style={{ background: "linear-gradient(135deg, #e879f9, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{value}</p>
              <p className="text-sm text-white/40">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const steps = [
    { num: "01", icon: "🏥", title: "Pick a facility", body: "Search our directory of 10+ Palm Springs and Coachella Valley nursing homes and assisted living centres.", color: "#e879f9" },
    { num: "02", icon: "🎁", title: "Choose gifts", body: "Browse soft fruits, comfort items, flowers, cookies, and more. Add multiple items with one tap.", color: "#818cf8" },
    { num: "03", icon: "🚚", title: "We deliver", body: "Our local team picks, packs, and hand-delivers to the nursing station within 2–4 hours.", color: "#22d3ee" },
  ];

  return (
    <Section id="how-it-works" className="py-16">
      <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}>
        <SectionLabel>How it works</SectionLabel>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white text-center mb-4 tracking-tight">Three steps to a smile</motion.h2>
        <motion.p variants={fadeUp} className="text-center text-white/40 mb-16 max-w-lg mx-auto">No accounts required. No complicated forms. Just pick, choose, and send.</motion.p>
        <div className="grid sm:grid-cols-3 gap-6 relative">
          <div className="absolute hidden sm:block top-10 left-[calc(33%-20px)] right-[calc(33%-20px)] h-px" style={{ background: "linear-gradient(90deg, #e879f9, #818cf8, #22d3ee)" }} />
          {steps.map((step, i) => (
            <GlowCard key={step.num} glowColor={step.color} delay={i * 0.1} className="p-8">
              <div className="flex items-start justify-between mb-6">
                <motion.span whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }} className="text-4xl">{step.icon}</motion.span>
                <span className="text-xs font-black tracking-widest" style={{ color: step.color }}>{step.num}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{step.body}</p>
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${step.color}66, transparent)` }} />
            </GlowCard>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

function GiftSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const categories = [
    { emoji: "🍑", label: "Soft Fruits", desc: "Peaches, grapes, mangos, pears — gentle on sensitive teeth.", color: "#fb923c" },
    { emoji: "🍪", label: "Snacks & Treats", desc: "Soft cookies, chocolate truffles, pudding cups, herbal tea.", color: "#fde047" },
    { emoji: "🧣", label: "Comfort Items", desc: "Fleece throws, slipper socks, hand lotion, lavender pillows.", color: "#e879f9" },
    { emoji: "🌻", label: "Flowers & Plants", desc: "Sunflowers, spring bouquets, low-maintenance succulents.", color: "#4ade80" },
    { emoji: "📖", label: "Activities", desc: "Large-print puzzles, card games, memory albums.", color: "#22d3ee" },
    { emoji: "💐", label: "Custom Baskets", desc: "Mix and match across categories to create a personal bundle.", color: "#818cf8" },
  ];

  return (
    <Section id="gifts" className="py-16">
      <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}>
        <SectionLabel>Gift catalog</SectionLabel>
        <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white text-center mb-4 tracking-tight">Everything they&apos;ll love</motion.h2>
        <motion.p variants={fadeUp} className="text-center text-white/40 mb-16 max-w-lg mx-auto">Every item is selected with elderly comfort in mind — soft textures, easy to open, thoughtfully chosen.</motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <GlowCard key={cat.label} glowColor={cat.color} delay={i * 0.07} className="p-6">
              <motion.div whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="text-4xl mb-4 inline-block">{cat.emoji}</motion.div>
              <h3 className="font-bold text-white mb-2">{cat.label}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{cat.desc}</p>
              <Link href="/order" className="mt-4 text-xs font-semibold block" style={{ color: cat.color }}>Browse →</Link>
            </GlowCard>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

function FamilyFeature() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const fakeOrders = [
    { sender: "Sarah", item: "🍑 Ripe Peach Box", time: "2h ago", status: "Delivered" },
    { sender: "Michael", item: "🧣 Cozy Fleece Throw", time: "Yesterday", status: "Delivered" },
    { sender: "Emma", item: "🌻 Sunflower Bouquet", time: "3 days ago", status: "Delivered" },
  ];

  return (
    <Section id="about" className="py-16">
      <div ref={ref} className="grid sm:grid-cols-2 gap-12 items-center">
        <motion.div variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"}>
          <SectionLabel>Family dashboard</SectionLabel>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight">Stay coordinated<br />as a family.</motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 mb-6 leading-relaxed">
            Share a family code with siblings and relatives. Everyone can see what was sent, when, and by whom — so grandma never gets three bouquets in one day and nothing the next.
          </motion.p>
          <motion.ul variants={stagger} className="space-y-3 mb-8">
            {["No sign-up required — just a shared code", "Real-time order history across the whole family", "One tap to view what's already been sent"].map((item) => (
              <motion.li key={item} variants={fadeUp} className="flex items-start gap-3 text-sm text-white/60">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5" style={{ background: "#e879f920", color: "#e879f9" }}>✓</span>
                {item}
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 0 30px #e879f944" }} whileTap={{ scale: 0.97 }} className="px-6 py-3 rounded-full font-semibold text-sm border transition-all" style={{ borderColor: "#e879f9", color: "#e879f9" }}>
                Open family dashboard →
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <div className="rounded-2xl border border-white/8 p-4 sm:p-6" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-white/30 mb-0.5">Family code</p>
                <p className="font-mono font-black text-lg tracking-widest" style={{ color: "#e879f9" }}>JKRT82</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["3", "Orders"], ["8", "Gifts"], ["$112", "Spent"]].map(([v, l]) => (
                  <div key={l}><p className="font-black text-white text-sm">{v}</p><p className="text-[10px] text-white/30">{l}</p></div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {fakeOrders.map((o, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div><p className="text-xs text-white/30 mb-0.5">{o.sender}</p><p className="text-sm text-white font-medium">{o.item}</p></div>
                  <div className="text-right">
                    <p className="text-xs text-white/30 mb-1">{o.time}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#4ade8020", color: "#4ade80" }}>{o.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <Section className="py-16 pb-20">
      <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative rounded-3xl overflow-hidden text-center px-8 py-20" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(232,121,249,0.12) 0%, transparent 70%)" }} />
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#e879f9" }}>Start today</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.6 }} className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-5">
          Make someone&apos;s day<br />
          <span style={{ background: "linear-gradient(90deg, #e879f9, #818cf8, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in 60 seconds.</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.45 }} className="text-white/40 mb-10 max-w-md mx-auto">No account needed. No subscription. Just a thoughtful gift, delivered fast.</motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.55 }}>
          <Link href="/order">
            <motion.button whileHover={{ scale: 1.06, boxShadow: "0 0 50px rgba(232,121,249,0.5)" }} whileTap={{ scale: 0.97 }} className="px-10 py-5 rounded-full text-lg font-black text-black" style={{ background: "linear-gradient(135deg, #e879f9, #818cf8, #22d3ee)" }}>
              Send a gift now →
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/25">
        <span className="font-black text-white/40">Heart<span style={{ color: "#e879f9" }}>Cart</span></span>
        <span>Palm Springs Area &mdash; Coachella Valley</span>
        <div className="flex gap-6">
          <Link href="/order" className="hover:text-white/60 transition-colors">Order</Link>
          <Link href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08080f", color: "white" }}>
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <GiftSection />
      <FamilyFeature />
      <FinalCTA />
      <Footer />
    </div>
  );
}
