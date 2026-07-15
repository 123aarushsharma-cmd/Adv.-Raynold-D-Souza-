import React, { useState, useEffect, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight, Star, Award, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  organization: string;
  practiceArea: string;
  rating: number;
  verifiedDate: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Advocate Reynold D'Souza represents the peak of legal scholarship in the High Court of Karnataka. In our writ petition challenging an arbitrary municipal acquisition, his command of administrative law and masterfully drafted petition secured an interim stay, and ultimately a favorable final order. He was incredibly structured, composed, and unyielding.",
    author: "Srinivasa Reddy",
    title: "Managing Trustee",
    organization: "Reddy Educational Trust",
    practiceArea: "Writ Petitions & Constitutional Law",
    rating: 5,
    verifiedDate: "October 2025"
  },
  {
    id: 2,
    quote: "We were embroiled in a highly complex RERA dispute and partition suit spanning multiple generations. Advocate Reynold D'Souza meticulously traced the property's title deeds from the 1970s and presented an airtight argument before the Appellate Tribunal. His deep understanding of Karnataka Land Revenue and RERA laws saved our family property.",
    author: "Latha Ramakrishnan",
    title: "Retired Bank Officer",
    organization: "Indiranagar Residents Association",
    practiceArea: "RERA & Real Estate Law",
    rating: 5,
    verifiedDate: "February 2026"
  },
  {
    id: 3,
    quote: "When a multi-crore infrastructure agreement stalled due to contract breaches and jurisdiction conflicts, Advocate Reynold structured our entire domestic arbitration strategy. His cross-examination during the arbitration sessions was exceptionally precise, securing a comprehensive award in our favor. A truly elite legal mind.",
    author: "Dr. K. Raghavan",
    title: "Managing Director",
    organization: "Deccan Infra Developers Pvt. Ltd.",
    practiceArea: "Commercial Disputes & Arbitration",
    rating: 5,
    verifiedDate: "December 2025"
  },
  {
    id: 4,
    quote: "Facing a completely frivolous criminal complaint designed to harass our executives, we approached Olive Law Chambers. Advocate Reynold D'Souza represented us before the High Court of Karnataka under Section 482 of CrPC. The Hon'ble Court was fully convinced by his brilliant legal arguments and quashed the entire proceedings. Professionalism at its finest.",
    author: "Sanjay Deshpande",
    title: "Director of Operations",
    organization: "Kalyani Tech Ventures",
    practiceArea: "Criminal Defense & High Court Appeals",
    rating: 5,
    verifiedDate: "May 2026"
  }
];

export default function ClientTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slideNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const slidePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay management
  useEffect(() => {
    if (!isAutoplayPaused) {
      autoplayTimerRef.current = setInterval(() => {
        slideNext();
      }, 7000); // 7 seconds per slide for peaceful reading
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplayPaused, currentIndex]);

  // Framer motion variants for smooth slide/fade animations
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <section 
      id="testimonials"
      className="py-16 md:py-20 bg-sage-light/20 text-charcoal border-t border-b border-forest/5 relative overflow-hidden"
      aria-label="Client Testimonials and Endorsements"
    >
      {/* Decorative architectural background line accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      
      {/* Soft background glow circles */}
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[350px] h-[350px] bg-gold/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[350px] h-[350px] bg-forest/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title with premium legal aesthetic */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold/50" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              Professional Endorsements
            </span>
            <span className="w-8 h-px bg-gold/50" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest tracking-tight">
            Client &amp; Professional Testimonials
          </h2>
          <p className="font-sans text-xs sm:text-sm text-charcoal/60 uppercase tracking-widest font-semibold mt-3">
            Scholarly Advocacy • Proven Judicial Results
          </p>
          <div className="mt-5 h-[1px] w-12 bg-gold mx-auto" />
        </div>

        {/* Testimonials Carousel Wrapper */}
        <div 
          className="relative min-h-[420px] sm:min-h-[340px] flex flex-col justify-between"
          onMouseEnter={() => setIsAutoplayPaused(true)}
          onMouseLeave={() => setIsAutoplayPaused(false)}
        >
          {/* Main Card Container */}
          <div className="relative w-full flex-grow overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full bg-ivory border border-forest/10 p-6 sm:p-10 md:p-12 rounded-sm shadow-[0_12px_40px_rgba(40,54,24,0.03)] flex flex-col justify-between relative"
              >
                {/* Gold quotation mark corner decoration */}
                <div className="absolute top-4 right-6 text-gold/15 pointer-events-none">
                  <Quote size={80} strokeWidth={1} />
                </div>

                <div>
                  {/* Top metadata (Stars, practice area badge) */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-forest/5">
                    <div className="flex items-center gap-1.5 bg-forest/5 px-3 py-1 rounded-full border border-forest/10">
                      <ShieldCheck className="text-gold w-4 h-4" />
                      <span className="font-sans text-[10px] tracking-wider text-forest font-bold uppercase">
                        {testimonials[currentIndex].practiceArea}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-gold text-gold" />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Quote */}
                  <blockquote className="mb-8">
                    <p className="font-serif text-lg sm:text-xl md:text-2xl text-charcoal/90 leading-relaxed font-light italic">
                      "{testimonials[currentIndex].quote}"
                    </p>
                  </blockquote>
                </div>

                {/* Author Metadata block */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4">
                  <div className="flex items-center gap-4">
                    {/* Placeholder initial-badge icon to ensure premium feel */}
                    <div className="w-12 h-12 rounded-full bg-forest text-gold flex items-center justify-center font-serif text-lg font-bold border border-gold/25 shadow-sm">
                      {testimonials[currentIndex].author.replace("Advocate ", "").replace("Justice ", "").charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-forest leading-snug">
                        {testimonials[currentIndex].author}
                      </h4>
                      <p className="font-sans text-xs text-charcoal/60">
                        {testimonials[currentIndex].title}, <span className="font-medium text-forest/85">{testimonials[currentIndex].organization}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-sage-light/40 px-3 py-1.5 rounded border border-forest/5">
                    <Award size={13} className="text-gold" />
                    <span className="font-sans text-[9px] tracking-widest text-charcoal/70 uppercase font-semibold">
                      Verified {testimonials[currentIndex].verifiedDate}
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation and Indicators Row */}
          <div className="flex items-center justify-between mt-8 relative z-20">
            {/* Manual Navigation Arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={slidePrev}
                className="w-10 h-10 rounded-full border border-forest/15 text-forest flex items-center justify-center hover:bg-forest hover:text-gold hover:border-gold/30 active:scale-90 transition-all cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={slideNext}
                className="w-10 h-10 rounded-full border border-forest/15 text-forest flex items-center justify-center hover:bg-forest hover:text-gold hover:border-gold/30 active:scale-90 transition-all cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Quick-jump Dot Indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx 
                      ? "w-8 bg-gold" 
                      : "w-2 bg-forest/15 hover:bg-forest/30"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Autoplay Pause/Play Visual Indicator */}
            <span className="hidden sm:inline-block font-sans text-[9px] uppercase tracking-wider text-charcoal/40 font-medium">
              {isAutoplayPaused ? "Autoplay Paused" : "Autoplay Active"}
            </span>
          </div>

        </div>

        {/* Fine-print legal standard alignment */}
        <div className="mt-14 text-center max-w-2xl mx-auto border-t border-forest/5 pt-6">
          <p className="font-sans text-[10px] text-charcoal/50 leading-relaxed font-light">
            In compliance with chapter standards and legal advertising guidelines, these testimonials represent historical reflections of counsel by professional peers and past clients. These representations do not constitute a forecast, warranty, or guarantee regarding the final outcome of any active or future legal litigation matters.
          </p>
        </div>

      </div>
    </section>
  );
}
