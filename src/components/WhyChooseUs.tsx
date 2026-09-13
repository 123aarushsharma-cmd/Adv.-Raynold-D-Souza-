import React from "react";
import { Scale, HeartHandshake, Coins, Trophy, CheckCircle, ShieldCheck, Award, Users } from "lucide-react";
import { motion } from "motion/react";
import ScrollAnimate from "./ScrollAnimate";
import SectionHeaderReveal from "./SectionHeaderReveal";
import { useFirmContent } from "../hooks/useFirmContent";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: <Scale className="text-gold" size={28} />,
    title: "Scholarly Litigation",
    desc: "Advocate Reynold D'Souza is a graduate of a premier academic institution with decades of trial and litigation experience before high courts and tribunals.",
  },
  {
    icon: <HeartHandshake className="text-gold" size={28} />,
    title: "Client-Centered Approach",
    desc: "We prioritize deep personal empathy and communication. We limit our active caseload to dedicate custom attention to every matter.",
  },
  {
    icon: <Coins className="text-gold" size={28} />,
    title: "Transparent Fee Structure",
    desc: "Clear itemizations, flat-rate options, and contingency-based civil routes. No sudden fees or hidden billing schedules.",
  },
  {
    icon: <Trophy className="text-gold" size={28} />,
    title: "Scholarly Preparation",
    desc: "Every case is approached with exhaustive legal research, thorough draft preparation, and complete adherence to professional standards.",
  },
];

export default function WhyChooseUs() {
  const { content } = useFirmContent();
  const stats = content.stats;

  return (
    <section id="why-choose-us" className="py-14 md:py-16 bg-forest text-ivory relative overflow-hidden">
      {/* Background motif */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none motif-bg" />
      
      {/* Subtle radial glow */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Reveal-on-Scroll Section Title */}
        <SectionHeaderReveal
          eyebrow="The Professional Standard"
          title="Why Clients Trust Advocate Reynold D'Souza"
          theme="dark"
          alignment="center"
          maxWidth="max-w-2xl"
          className="mb-10"
        />

        {/* Dynamic Firm Key Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-ivory/5 border border-gold/20 p-5 rounded-sm flex flex-col justify-between hover:border-gold/50 transition-colors"
            >
              <div>
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gold font-bold block tracking-tight">
                  {stat.value}
                </span>
                <span className="font-serif text-sm font-bold text-ivory block mt-1">
                  {stat.label}
                </span>
              </div>
              <p className="font-sans text-[11px] text-ivory/70 mt-2 font-light">
                {stat.subtext}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Features Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <ScrollAnimate key={idx} variant="fade-up" delay={idx * 120} duration={0.8} className="h-full">
              <motion.div
                className="bg-ivory/5 border border-gold/15 p-8 rounded-sm hover:border-gold/50 transition-colors group flex flex-col justify-between relative overflow-hidden shadow-sm h-full"
                whileHover={{ 
                  y: -6,
                  backgroundColor: "rgba(250, 249, 246, 0.08)"
                }}
                style={{ willChange: "transform, background-color, border-color" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div>
                  {/* Icon Container */}
                  <div className="w-14 h-14 rounded-full bg-ivory/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 border border-gold/25">
                    {feat.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-serif text-xl font-bold text-ivory mb-3 tracking-wide">
                    {feat.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="font-sans text-sm text-ivory/80 leading-relaxed font-light">
                    {feat.desc}
                  </p>
                </div>

                {/* Decorative Accent */}
                <div className="flex items-center gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle size={14} className="text-gold" />
                  <span className="font-sans text-[10px] tracking-widest text-gold uppercase font-semibold">
                    Guaranteed Quality
                  </span>
                </div>
              </motion.div>
            </ScrollAnimate>
          ))}
        </div>

        {/* Quality commitment quote block */}
        <div className="mt-16 text-center max-w-3xl mx-auto border-t border-gold/20 pt-10">
          <p className="font-serif text-lg sm:text-xl italic font-light text-ivory/90 leading-relaxed">
            "Justice is never accidental; it is the deliberate result of expert, ethical defense, scholarly planning, and persistent, fearless execution."
          </p>
          <span className="font-sans text-xs text-gold uppercase tracking-[0.2em] font-semibold mt-3 block">
            — Advocate Reynold D'Souza
          </span>
        </div>

      </div>
    </section>
  );
}
