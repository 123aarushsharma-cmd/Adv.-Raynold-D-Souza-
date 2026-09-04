import React from "react";
import { Award, Briefcase, GraduationCap, MapPin, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useTeamProfiles } from "../hooks/useTeamProfiles";

export default function AdditionalAdvocates() {
  const { advocates } = useTeamProfiles();

  return (
    <section id="advocates" className="py-14 md:py-16 bg-sage-light/20 border-t border-b border-gold/15 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-gold" />
            <span className="font-sans text-xs sm:text-sm text-gold font-bold tracking-[0.2em] uppercase">
              Our Advocates
            </span>
            <span className="w-8 h-px bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest tracking-tight">
            Additional Legal Advisors
          </h2>
          <div className="mt-4 h-[1px] w-12 bg-gold mx-auto" />
          <p className="font-sans text-sm text-charcoal/70 mt-3 font-light">
            Our firm is strengthened by highly qualified associates stationed across major judicial hubs in Karnataka, ensuring continuous advocacy from trial courts to appellate benches.
          </p>
        </div>

        {/* Advocates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advocates.map((advocate, idx) => (
            <motion.article
              key={advocate.id || advocate.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white border border-forest/10 p-6 sm:p-8 rounded-sm shadow-sm flex flex-col justify-between hover:shadow-md hover:border-gold/30 transition-all group relative"
            >
              <div>
                {/* Header branding / Portrait or Initials badge */}
                <div className="flex items-center justify-between border-b border-forest/5 pb-4 mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 rounded-sm bg-forest text-gold overflow-hidden border border-forest/20 flex items-center justify-center font-serif text-base font-bold shadow-sm relative shrink-0">
                      {advocate.photoUrl ? (
                        <img
                          src={advocate.photoUrl}
                          alt={advocate.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="group-hover:text-gold transition-colors">
                          {advocate.name.split(" ").slice(-2)[0]?.[0] || "A"}
                          {advocate.name.split(" ").slice(-1)[0]?.[0] || "L"}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold block w-fit">
                        {advocate.admissionNo}
                      </span>
                      <span className="text-[10px] text-charcoal/50 uppercase tracking-widest mt-1 block">
                        Advocate Roster
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name and Role */}
                <h3 className="font-serif text-xl font-bold text-forest group-hover:text-gold transition-colors duration-200">
                  {advocate.name}
                </h3>
                <p className="font-sans text-xs text-gold font-bold tracking-wider uppercase mt-1">
                  {advocate.role}
                </p>

                <p className="font-sans text-sm text-charcoal/80 leading-relaxed font-light mt-4 mb-6 italic">
                  "{advocate.bio}"
                </p>

                {/* Details list */}
                <div className="space-y-3 pt-4 border-t border-forest/5">
                  <div className="flex items-start gap-2.5 text-xs">
                    <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-sans font-semibold text-forest block">Location Presence</span>
                      <span className="font-sans text-charcoal/70">{advocate.location}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <GraduationCap size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-sans font-semibold text-forest block">Education</span>
                      <span className="font-sans text-charcoal/70">{advocate.education}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <Briefcase size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-sans font-semibold text-forest block">Experience</span>
                      <span className="font-sans text-charcoal/70">{advocate.experience}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <Shield size={14} className="text-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="font-sans font-semibold text-forest block">Core Practice Focus</span>
                      <span className="font-sans text-charcoal/70">{advocate.specialization}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
