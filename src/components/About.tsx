import React from "react";
import { motion } from "motion/react";
import { Scale, Shield, Check, BookOpen, Clock } from "lucide-react";

const pillars = [
  {
    title: "Rigorous Scholarship",
    desc: "Every matter is studied thoroughly, drafting robust legal frameworks and conducting exhaustive precedent research to cover all statutory variables.",
    icon: <BookOpen size={18} />
  },
  {
    title: "Unyielding Integrity",
    desc: "Complete fidelity to ethical advocacy standards, maintaining absolute transparency and direct consultation directly with the advocate.",
    icon: <Shield size={18} />
  },
  {
    title: "Strategic Resolution",
    desc: "Proactive litigation mapping, providing client-focused risk assessments and custom approaches tailored to courts and tribunals.",
    icon: <Scale size={18} />
  },
  {
    title: "Direct Commitment",
    desc: "Direct accessibility for all urgent legal needs, ensuring precise and regular case briefings directly to the client without filters.",
    icon: <Clock size={18} />
  }
];

export default function About() {

  return (
    <section className="py-14 md:py-16 bg-sage-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Column 1: Founder's Portrait & Credentials (4 Cols) */}
          <div className="lg:col-span-4 md:col-span-1 flex flex-col">
            <div className="relative group bg-white border border-forest/10 p-5 rounded-sm shadow-sm transition-all duration-300 hover:shadow-lg">
              {/* Double border aesthetic frame */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-gold/20 p-1 bg-ivory">
                <div className="w-full h-full relative overflow-hidden rounded-sm">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"
                    alt="Advocate Reynold D'Souza"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Elegant decorative gold overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Gold Corner accents */}
                  <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold" />
                  <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold" />
                  <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold" />
                  <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold" />
                </div>
              </div>

              {/* Bio Details */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                  <span className="font-sans text-[10px] tracking-[0.2em] text-gold font-bold uppercase">
                    Founder &amp; Principal
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-forest leading-tight">
                  Reynold D'Souza
                </h3>
                <p className="font-sans text-xs font-semibold text-gold uppercase tracking-wider">
                  Advocate, High Court of Karnataka
                </p>
                
                <p className="font-sans text-xs text-charcoal/80 leading-relaxed pt-1">
                  Enrolled under the Bar Council, representing clients in Civil, Criminal, Constitutional, and Commercial litigation across Karnataka.
                </p>
                
                {/* Note / Quote inside portrait card */}
                <div className="mt-4 bg-sage-light/50 p-4 rounded-sm border border-dashed border-forest/15">
                  <p className="text-[11px] italic text-forest font-light leading-relaxed">
                    "Justice is not just a destination, but the path we walk with every client we serve. Our commitment to your rights is absolute."
                  </p>
                  <p className="text-[9px] text-gold font-bold mt-2 uppercase tracking-widest text-right">
                    — Founder's Note
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Story & Mission Panel (5 Cols) */}
          <div className="lg:col-span-5 md:col-span-1">
            {/* Subsection header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-gold" />
              <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
                Our Foundation
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest tracking-tight mb-6 leading-tight">
              A Legacy Built on Absolute Trust, Integrity &amp; Pursuit of Justice
            </h2>

            <div className="space-y-5 text-charcoal/90 leading-relaxed font-sans font-light text-sm sm:text-base">
              <p>
                Led by <strong>Advocate Reynold D'Souza</strong>, our practice has been established on the core principles of truth, transparency, and uncompromised legal defense. We operate with the deep belief that every client deserves not only aggressive, expert advocacy, but also profound respect and absolute empathy in their times of trial.
              </p>
              <p>
                With a robust litigation career presenting before the <strong>High Court of Karnataka, District Courts, Civil and Sessions Courts, and Tribunals</strong>, Advocate Reynold D'Souza is highly accomplished in handling complex statutory matters. We maintain an unyielding scholarly rigor, ensuring our defense strategies are robust and precise.
              </p>
            </div>

            {/* Mission Panel */}
            <div className="border-l-4 border-gold bg-forest text-ivory p-6 rounded-r-sm border border-gold/15 mt-8 relative flex flex-col justify-center shadow-sm">
              <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none text-gold font-serif text-6xl font-black">
                “
              </div>
              <h3 className="font-serif text-lg italic font-normal text-gold mb-2">
                Our Mission
              </h3>
              <p className="font-sans text-xs sm:text-sm text-ivory/90 leading-relaxed font-light">
                To deliver world-class legal advocacy rooted in unwavering ethics, guiding our clients through complex statutory terrains, restoring peace of mind, and securing equitable outcomes.
              </p>
            </div>
          </div>

          {/* Column 3: Pillars of Practice Panel (3 Cols) */}
          <div className="lg:col-span-3 md:col-span-2 lg:col-span-3 flex flex-col gap-6 justify-start h-full">
            <div className="relative border border-gold/20 p-6 rounded-sm bg-white shadow-sm">
              <div className="text-center mb-6">
                <span className="font-serif text-xl sm:text-2xl text-forest italic font-semibold">
                  Pillars of Practice
                </span>
                <p className="font-sans text-[10px] text-charcoal/60 mt-1 uppercase tracking-widest font-medium">
                  Core Professional Commitments
                </p>
              </div>

              {/* Pillars list */}
              <div className="space-y-6">
                {pillars.map((pillar, index) => (
                  <motion.div 
                    key={index} 
                    className="flex gap-4 items-start group/pillar cursor-default"
                    whileHover={{ x: 4 }}
                    style={{ willChange: "transform" }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest shrink-0 border border-forest/10 group-hover/pillar:bg-gold/10 group-hover/pillar:text-gold group-hover/pillar:border-gold/25 transition-colors duration-300">
                      {pillar.icon}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-forest group-hover/pillar:text-gold transition-colors duration-200">
                        {pillar.title}
                      </h4>
                      <p className="font-sans text-xs text-charcoal/75 leading-relaxed mt-1 font-light">
                        {pillar.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick trust blurb */}
            <p className="font-sans text-[10px] text-center text-charcoal/60 leading-relaxed max-w-xs mx-auto font-light">
              *All advocacy procedures are in absolute compliance with Advocate professional standards under the Advocates Act.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
