'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function DashboardHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax for Text
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Staggered Text Variants (Reference 1 Style)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
  };

  const charVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Apple Ease
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[85vh] min-h-[700px] overflow-hidden rounded-b-[40px] md:rounded-b-[60px]"
    >
      {/* 1. Background */}
      <div className="absolute inset-0 z-0 bg-[#0f172a]">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-green-900/40 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[80%] bg-blue-900/40 rounded-full blur-[120px] animate-pulse-slower mix-blend-screen" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center pt-32 pb-20">
        <motion.div
          style={{ y: textY, opacity }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          {/* Left: Title */}
          <div className="space-y-8">
            <motion.h1
              className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter text-white leading-[0.9] overflow-hidden"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="overflow-hidden flex flex-wrap gap-x-6">
                <AnimatedWord text="Data-driven" variants={charVariants} />
              </div>
              <div className="overflow-hidden flex flex-wrap gap-x-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500">
                  <AnimatedWord text="Future." variants={charVariants} />
                </span>
              </div>
            </motion.h1>
          </div>

          {/* Right: Description */}
          <div className="lg:max-w-md lg:ml-auto">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="relative"
            >
              <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-green-500 to-transparent hidden md:block" />
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light tracking-tight">
                A calm structure for modern ideas. <br />
                <span className="text-white font-medium">127+ ESG SaaS</span> companies analyzed to provide crystal clear insights.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
    </section>
  );
}

// ------------------------------------------------------------------
// Micro Components
// ------------------------------------------------------------------

function AnimatedWord({ text, variants }: { text: string, variants: any }) {
  return (
    <span className="inline-flex whitespace-nowrap overflow-hidden">
      {text.split("").map((char, i) => (
        <motion.span key={`${char}-${i}`} variants={variants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}