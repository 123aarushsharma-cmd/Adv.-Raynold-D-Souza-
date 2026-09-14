import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import PracticeAreas from "./components/PracticeAreas";
import WhyChooseUs from "./components/WhyChooseUs";
import AdditionalAdvocates from "./components/AdditionalAdvocates";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ConsultationModal from "./components/ConsultationModal";
import ScrollAnimate from "./components/ScrollAnimate";
import AdminPortal from "./components/AdminPortal";
import CookieConsent from "./components/CookieConsent";
import { PrivacyPolicyModal, TermsOfServiceModal } from "./components/LegalModals";
import SplashPreloader from "./components/SplashPreloader";
import ClientTestimonials from "./components/ClientTestimonials";
import CyberSecurityShield from "./components/CyberSecurityShield";
import ScrollProgressAndTop from "./components/ScrollProgressAndTop";
import DisclaimerModal from "./components/DisclaimerModal";
import { assetPreloader, CRITICAL_FIRM_ASSETS } from "./lib/assetPreloader";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [adminInitialTab, setAdminInitialTab] = useState<"consultations" | "notifications" | "team" | "analytics" | "branding">("consultations");
  const [adminTeamTarget, setAdminTeamTarget] = useState<"founder" | string>("founder");

  // Pre-cache critical brand & aesthetic assets in the background on initial idle loop
  useEffect(() => {
    assetPreloader.preload(CRITICAL_FIRM_ASSETS, "high");
  }, []);

  // Monitor URL Path, Hash or Query to open the Admin Portal securely
  useEffect(() => {
    const checkAdmin = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Support /admin, /admin/branding, /admin/team, olivelawfirm.in/admin, and hash variations
      if (
        path === "/admin" || 
        path.startsWith("/admin/") || 
        hash === "#admin" || 
        search.includes("admin=true") || 
        search.includes("admin=1")
      ) {
        if (hash === "#admin-team" || path.includes("/team")) {
          setAdminInitialTab("team");
          setAdminTeamTarget("founder");
        } else if (hash === "#admin-logo" || hash === "#admin-branding" || path.includes("/branding") || path.includes("/logo")) {
          setAdminInitialTab("branding");
        } else {
          setAdminInitialTab("consultations");
        }
        setIsAdminOpen(true);
      }
    };

    checkAdmin();
    window.addEventListener("hashchange", checkAdmin);
    window.addEventListener("popstate", checkAdmin);
    return () => {
      window.removeEventListener("hashchange", checkAdmin);
      window.removeEventListener("popstate", checkAdmin);
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isAdminOpen) {
    return (
      <AdminPortal 
        initialTab={adminInitialTab}
        initialTeamTarget={adminTeamTarget}
        onClose={() => {
          setIsAdminOpen(false);
          // Clean up the URL/hash safely without a page reload
          const cleanPath = window.location.pathname.startsWith("/admin") ? "/" : window.location.pathname;
          window.history.pushState("", document.title, cleanPath);
        }} 
      />
    );
  }

  return (
    <>
      <CyberSecurityShield />
      <AnimatePresence mode="wait">
        {isSplashActive && (
          <SplashPreloader key="splash" onComplete={() => setIsSplashActive(false)} />
        )}
      </AnimatePresence>

      <div className="relative min-h-screen bg-ivory font-sans text-charcoal flex flex-col justify-between selection:bg-gold/20 selection:text-forest overflow-x-hidden">
      {/* Sticky Header Navigation */}
      <Header 
        onOpenConsultationModal={openModal} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: About Story & Mission */}
        <About />

        {/* Section 3: Practice Areas Competencies Grid */}
        <PracticeAreas />

        {/* Section 4: Why Choose Us Feature Row */}
        <WhyChooseUs />

        {/* Section 4.1: Additional Advocates */}
        <AdditionalAdvocates />

        {/* Section 4.5: Peer & Client Endorsements Carousel */}
        <ClientTestimonials />

        {/* Section 5: Admissions Case Intake Desk */}
        <Contact />

        {/* Section 6: FAQ Dossier (Compact & Humanized) */}
        <FAQ />
      </main>

      {/* Footer Navigation & Advertising compliance */}
      <Footer 
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* High-FPS GPU Scroll Progress Indicator & Quick Return Button */}
      <ScrollProgressAndTop />

      {/* Interactive Modal Booking Dialogue */}
      <ConsultationModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Regulatory Cookie Consent Banner */}
      {!isSplashActive && (
        <>
          <DisclaimerModal 
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenTerms={() => setIsTermsOpen(true)}
          />
          <CookieConsent 
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenTerms={() => setIsTermsOpen(true)}
          />
        </>
      )}

      {/* Legal Protected Disclaimers & Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
    </>
  );
}
