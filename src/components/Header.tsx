import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import { 
  PhoneCall, 
  Calendar, 
  Home, 
  User, 
  Scale, 
  Award, 
  MessageSquare, 
  Landmark, 
  ShieldAlert, 
  Building2, 
  ShieldCheck, 
  Briefcase, 
  HeartHandshake, 
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface HeaderProps {
  onOpenConsultationModal: () => void;
  onOpenAdmin: () => void;
  onOpenUserPortal: () => void;
}

const practiceSubmenu = [
  { name: "Constitutional & Human Rights", href: "#practice-constitutional", icon: Landmark },
  { name: "Criminal Defense & Trial", href: "#practice-criminal", icon: ShieldAlert },
  { name: "Property & RERA Law", href: "#practice-property", icon: Building2 },
  { name: "Consumer Rights Protection", href: "#practice-consumer", icon: ShieldCheck },
  { name: "Labour & Admin Tribunals", href: "#practice-labour", icon: Briefcase },
  { name: "Arbitration & Family Law", href: "#practice-arbitration", icon: HeartHandshake },
];

const navLinks = [
  { name: "Home", href: "#home", icon: Home },
  { name: "About", href: "#about", icon: User },
  { name: "Practice Areas", href: "#practice-areas", icon: Scale },
  { name: "Why Choose Us", href: "#why-choose-us", icon: Award },
  { name: "Contact", href: "#contact", icon: MessageSquare },
];

export default function Header({ onOpenConsultationModal, onOpenAdmin, onOpenUserPortal }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isPracticeDropdownOpen, setIsPracticeDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleNavClick(e, "#home");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled((prev) => (prev === scrolled ? prev : scrolled));

      let currentActive = "home";
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        currentActive = "contact";
      } else {
        for (const link of navLinks) {
          const id = link.href.substring(1);
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 160 && rect.bottom > 160) {
              currentActive = id;
              break;
            }
          }
        }
      }
      setActiveSection((prev) => (prev === currentActive ? prev : currentActive));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (href.startsWith("#practice-") && href !== "#practice-areas") {
      const areaId = href.replace("#practice-", "");
      window.dispatchEvent(new CustomEvent("open-practice-area", { detail: { id: areaId } }));
      return;
    }
    
    const targetId = href.substring(1);
    
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 85;
      const rect = element.getBoundingClientRect();
      const elementPosition = rect.top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      setActiveSection(targetId);
    }
  };

  return (
    <>
      {/* 1. Main Header (Sticky top bar, ultra-sleek, premium, high contrast) */}
      <header
        id="header-nav"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-forest/95 backdrop-blur-md shadow-lg text-ivory border-b border-gold/20"
            : "bg-forest/90 nav:bg-transparent backdrop-blur-sm nav:backdrop-blur-none text-ivory border-b border-gold/10 nav:border-b-0"
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 nav:px-8 transition-all duration-300 ${
          isScrolled ? "py-2.5" : "py-4 nav:py-5"
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="#home" onClick={handleLogoClick} className="flex items-center shrink-0" title="Olive Law Firm" id="header-logo-link">
              <Logo inverse={true} size={isScrolled ? 34 : 40} />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden nav:flex items-center gap-8" aria-label="Desktop navigation">
              {navLinks.map((link) => {
                const id = link.href.substring(1);
                const isActive = activeSection === id;
                const isPractice = link.name === "Practice Areas";

                if (isPractice) {
                  return (
                    <div
                      key={link.name}
                      className="relative py-3"
                      onMouseEnter={() => setIsPracticeDropdownOpen(true)}
                      onMouseLeave={() => setIsPracticeDropdownOpen(false)}
                    >
                      <button
                        id={`nav-link-${id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(id);
                          if (element) {
                            const offset = 85;
                            const rect = element.getBoundingClientRect();
                            const elementPosition = rect.top + window.scrollY;
                            const offsetPosition = elementPosition - offset;
                            window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth"
                            });
                          }
                        }}
                        className={`font-sans text-sm tracking-wide font-medium transition-all duration-200 flex items-center gap-1.5 hover:text-gold hover:scale-[1.02] active:scale-[0.98] cursor-pointer py-1 ${
                          isActive || isPracticeDropdownOpen ? "text-gold font-semibold" : "text-ivory/90"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isPracticeDropdownOpen ? "rotate-180" : ""}`} />
                        {isActive && (
                          <motion.span 
                            layoutId="activeUnderline" 
                            className="absolute bottom-2 left-0 w-full h-0.5 bg-gold rounded-full"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>

                      {/* Dropdown Menu (Quick Directories) */}
                      <AnimatePresence>
                        {isPracticeDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[280px] bg-forest/95 backdrop-blur-xl border border-gold/20 rounded-sm shadow-2xl p-3 z-50 grid grid-cols-1 gap-1"
                          >
                            <div className="text-[10px] tracking-widest text-gold uppercase font-bold px-3 pb-2 border-b border-gold/10 mb-1">
                              Quick Directories
                            </div>
                            {practiceSubmenu.map((sub) => {
                              const SubIcon = sub.icon;
                              return (
                                <a
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={(e) => handleNavClick(e, sub.href)}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gold/10 text-ivory/90 hover:text-gold transition-all duration-200 text-xs font-sans group font-medium"
                                >
                                  <div className="w-7 h-7 rounded-sm bg-gold/5 group-hover:bg-gold/15 text-gold flex items-center justify-center transition-colors shrink-0">
                                    <SubIcon size={14} />
                                  </div>
                                  <span className="font-serif text-xs transition-colors truncate">
                                    {sub.name}
                                  </span>
                                </a>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.name}
                    id={`nav-link-${id}`}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-sans text-sm tracking-wide font-medium transition-all duration-200 relative py-1 hover:text-gold hover:scale-[1.02] active:scale-[0.98] ${
                      isActive ? "text-gold font-semibold" : "text-ivory/90"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span 
                        layoutId="activeUnderline" 
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Action Area (Extremely Clean, Luxury Icon Buttons only - No text clutter) */}
            <div className="flex items-center gap-3 shrink-0" id="header-action-area">
              {/* Phone Icon Button */}
              <a 
                href="tel:+919740577775" 
                className="w-10 h-10 rounded-sm bg-gold/10 border border-gold/30 text-gold flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer hover:bg-gold/20 hover:text-ivory hover:border-gold hover:shadow-[0_0_12px_rgba(201,162,39,0.2)]"
                title="Call Advocate Reynold D'Souza: +91 97405 77775"
                id="header-phone-btn"
              >
                <PhoneCall size={16} />
              </a>

              {/* Book Consultation Icon Button */}
              <button
                onClick={onOpenConsultationModal}
                className="w-10 h-10 rounded-sm bg-gold text-forest flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer hover:bg-gold/90 hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(201,162,39,0.35)] animate-pulse-subtle"
                title="Book a Consultation"
                id="header-book-btn"
              >
                <Calendar size={16} />
              </button>


            </div>
          </div>
        </div>
      </header>

      {/* 2. Premium Floating Navigation Dock (Bottom centered, luxury glassmorphic design) */}
      <motion.div 
        id="mobile-floating-dock"
        className="fixed bottom-6 left-1/2 z-50 w-[90%] sm:w-[355px] bg-forest/90 backdrop-blur-md border border-gold/25 rounded-full px-4 py-1.5 shadow-[0_15px_40px_rgba(11,29,15,0.7),_inset_0_1px_1px_rgba(250,249,246,0.15)] flex items-center justify-between"
        initial={{ y: 20, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {navLinks.map((link) => {
          const id = link.href.substring(1);
          const isActive = activeSection === id;
          const Icon = link.icon;
          
          return (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="flex items-center justify-center relative w-11 h-11 group"
              id={`dock-link-${id}`}
              aria-label={link.name}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockHighlight"
                  className="absolute inset-0 bg-gold/10 rounded-full border border-gold/15"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon 
                size={18} 
                className={`relative z-10 transition-all duration-300 ${
                  isActive 
                    ? "text-gold scale-110" 
                    : "text-ivory/60 group-hover:text-gold"
                }`} 
              />
              {isActive && (
                <motion.span 
                  layoutId="activeDockDot"
                  className="absolute bottom-1 w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_#C9A227]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          );
        })}
      </motion.div>
    </>
  );
}
