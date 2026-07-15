import React from "react";
import Logo from "./Logo";
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight } from "lucide-react";

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export default function Footer({ onOpenAdmin, onOpenPrivacy, onOpenTerms }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80; // height of sticky nav
      const rect = element.getBoundingClientRect();
      const elementPosition = rect.top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About Firm", href: "#about" },
    { name: "Practice Areas", href: "#practice-areas" },
    { name: "Contact Firm", href: "#contact" },
  ];

  const socialLinks = [
    { name: "LinkedIn", href: "https://linkedin.com", icon: <Linkedin size={18} /> },
    { name: "Twitter", href: "https://twitter.com", icon: <Twitter size={18} /> },
    { name: "Facebook", href: "https://facebook.com", icon: <Facebook size={18} /> },
    { name: "Instagram", href: "https://instagram.com", icon: <Instagram size={18} /> },
  ];

  return (
    <footer className="bg-forest text-ivory border-t border-gold/25 relative overflow-hidden">
      {/* Background design dots pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />

      {/* Primary footer layout links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 border-b border-gold/15 pb-12">
          
          {/* Column 1: Brand & Blurb */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="w-fit">
              <Logo inverse={true} size={46} />
            </a>
            <p className="font-sans text-sm text-ivory/80 leading-relaxed font-light max-w-xl">
              Olive Law Firm is a premier multi-disciplinary advocate chamber in Bengaluru led by Advocate Reynold D'Souza. 
              We offer uncompromising legal strategy paired with meticulous scholarly research, 
              delivering equitable results that stand the test of time.
            </p>
            {/* Social Icons row */}
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gold/20 bg-ivory/5 hover:bg-gold hover:text-forest flex items-center justify-center transition-all duration-300 active:scale-90"
                  aria-label={`Connect with us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <h4 className="font-serif text-lg font-bold text-gold tracking-wide border-b border-gold/20 pb-2">
              Quick Directory
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="font-sans text-sm text-ivory/80 hover:text-gold transition-colors inline-flex items-center gap-1.5 font-light"
                >
                  <ArrowRight size={12} className="text-gold/60" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Compliance & Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/60 font-light">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start">
            <span>&copy; {currentYear} Olive Law Firm. All rights reserved.</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold" />
            <button 
              onClick={(e) => {
                e.preventDefault();
                onOpenPrivacy();
              }} 
              className="hover:text-gold transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-ivory/60 font-light"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold" />
            <button 
              onClick={(e) => {
                e.preventDefault();
                onOpenTerms();
              }} 
              className="hover:text-gold transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-ivory/60 font-light"
            >
              Terms of Service
            </button>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold" />
            <button 
              onClick={(e) => {
                e.preventDefault();
                onOpenAdmin();
              }} 
              className="hover:text-gold transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-ivory/60 font-light flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold/50 animate-pulse" />
              Admin Portal
            </button>
          </div>
          
          <div className="text-center sm:text-right text-[10px] tracking-wide uppercase text-gold/80 font-medium">
            Attorney Advertising • Prior Results Do Not Guarantee Similar Outflow
          </div>
        </div>

      </div>
    </footer>
  );
}
