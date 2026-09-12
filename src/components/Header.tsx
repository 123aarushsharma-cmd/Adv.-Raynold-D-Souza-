import React, { useState, useEffect, useRef } from "react";
import Logo from "./Logo";
import StickyBottomDock from "./StickyBottomDock";
import { 
  Home, 
  User, 
  Scale, 
  Award, 
  MessageSquare, 
  HelpCircle,
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
  { name: "FAQ", href: "#faq", icon: HelpCircle },
];

export default function Header({ onOpenConsultationModal, onOpenAdmin }: HeaderProps) {
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
        currentActive = "faq";
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
            {/* Logo (Left Column) */}
            <div className="flex-1 flex items-center justify-start">
              <a 
                href="#home" 
                onClick={handleLogoClick} 
                className="flex items-center shrink-0 transition-transform duration-200 hover:scale-[1.03] group active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded" 
                title="Olive Law Firm" 
                id="header-logo-link"
                aria-label="Olive Law Firm - Return to Home"
              >
                <Logo inverse={true} size={isScrolled ? 34 : 40} />
              </a>
            </div>

            {/* Desktop Navigation - Centered in screen */}
            <nav className="hidden nav:flex items-center justify-center shrink-0 gap-5 lg:gap-7 xl:gap-8" aria-label="Desktop primary navigation">
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
                        aria-expanded={isPracticeDropdownOpen}
                        aria-haspopup="true"
                        aria-controls="practice-areas-dropdown"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                            setIsPracticeDropdownOpen(true);
                          } else if (e.key === "Escape") {
                            setIsPracticeDropdownOpen(false);
                          }
                        }}
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
                        className={`font-sans text-sm tracking-wide font-medium transition-all duration-200 flex items-center gap-1.5 hover:text-gold hover:scale-[1.02] active:scale-[0.98] cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded ${
                          isActive || isPracticeDropdownOpen ? "text-gold font-semibold" : "text-ivory/90"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isPracticeDropdownOpen ? "rotate-180" : ""}`} aria-hidden="true" />
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
                            id="practice-areas-dropdown"
                            role="menu"
                            aria-label="Practice areas directory"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[280px] bg-forest/95 backdrop-blur-xl border border-gold/20 rounded-sm shadow-2xl p-3 z-50 grid grid-cols-1 gap-1"
                          >
                            <div className="text-[10px] tracking-widest text-gold uppercase font-bold px-3 pb-2 border-b border-gold/10 mb-1" role="presentation">
                              Quick Directories
                            </div>
                            {practiceSubmenu.map((sub) => {
                              const SubIcon = sub.icon;
                              return (
                                <a
                                  key={sub.name}
                                  role="menuitem"
                                  href={sub.href}
                                  onClick={(e) => {
                                    handleNavClick(e, sub.href);
                                    setIsPracticeDropdownOpen(false);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                      setIsPracticeDropdownOpen(false);
                                      document.getElementById(`nav-link-${id}`)?.focus();
                                    }
                                  }}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-gold/10 text-ivory/90 hover:text-gold transition-all duration-200 text-xs font-sans group font-medium focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                                >
                                  <div className="w-7 h-7 rounded-sm bg-gold/5 group-hover:bg-gold/15 text-gold flex items-center justify-center transition-colors shrink-0" aria-hidden="true">
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
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-sans text-sm tracking-wide font-medium transition-all duration-200 relative py-1 hover:text-gold hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded ${
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

            {/* Symmetrical Balance Spacer to ensure Navigation stays in the exact center of the screen */}
            <div className="hidden nav:flex flex-1 items-center justify-end" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* 2. Interactive Bottom Sticky Hover Dock (Logo-only Call & Client Intake with rich hover animations) */}
      <StickyBottomDock 
        onOpenConsultationModal={onOpenConsultationModal}
      />

      {/* 3. Premium Floating Navigation Dock (Mobile/Tablet centered, luxury glassmorphic design) */}
      <motion.nav 
        id="mobile-floating-dock"
        aria-label="Mobile bottom navigation"
        className="fixed bottom-3 sm:bottom-5 left-1/2 z-40 w-[92%] max-w-[350px] lg:hidden bg-forest/70 hover:bg-forest/90 backdrop-blur-xl border border-gold/25 hover:border-gold/45 rounded-full px-2.5 sm:px-3 py-1 shadow-[0_12px_32px_rgba(0,0,0,0.35),_inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-between transition-all duration-300"
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
              className="flex items-center justify-center relative w-10 h-10 group focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded-full"
              id={`dock-link-${id}`}
              aria-label={link.name}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeDockHighlight"
                  className="absolute inset-0 bg-gold/15 rounded-full border border-gold/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon 
                size={17} 
                className={`relative z-10 transition-all duration-300 ${
                  isActive 
                    ? "text-gold scale-110 drop-shadow-[0_0_6px_rgba(201,162,39,0.5)]" 
                    : "text-ivory/70 group-hover:text-gold"
                }`} 
                aria-hidden="true"
              />
              {isActive && (
                <motion.span 
                  layoutId="activeDockDot"
                  className="absolute bottom-1 w-1 h-1 bg-gold rounded-full shadow-[0_0_6px_#C9A227]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          );
        })}
      </motion.nav>
    </>
  );
}
