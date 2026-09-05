import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import PracticeAreas from "./components/PracticeAreas";
import WhyChooseUs from "./components/WhyChooseUs";
import AdditionalAdvocates from "./components/AdditionalAdvocates";
import FAQ from "./components/FAQ";
import Internships from "./components/Internships";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import ConsultationModal from "./components/ConsultationModal";
import ScrollAnimate from "./components/ScrollAnimate";
import AdminPortal from "./components/AdminPortal";
import CookieConsent from "./components/CookieConsent";
import { PrivacyPolicyModal, TermsOfServiceModal } from "./components/LegalModals";
import SplashPreloader from "./components/SplashPreloader";
import UserPortal from "./components/UserPortal";
import ClientTestimonials from "./components/ClientTestimonials";
import CyberSecurityShield from "./components/CyberSecurityShield";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isUserPortalOpen, setIsUserPortalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<"consultations" | "notifications" | "team" | "analytics" | "branding">("consultations");
  const [adminTeamTarget, setAdminTeamTarget] = useState<"founder" | string>("founder");

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
        onOpenUserPortal={() => setIsUserPortalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: About Story & Mission */}
        <ScrollAnimate id="about">
          <About />
        </ScrollAnimate>

        {/* Section 3: Practice Areas Competencies Grid */}
        <ScrollAnimate id="practice-areas">
          <PracticeAreas />
        </ScrollAnimate>

        {/* Section 4: Why Choose Us Feature Row */}
        <ScrollAnimate id="why-choose-us">
          <WhyChooseUs />
        </ScrollAnimate>

        {/* Section 4.1: Additional Advocates */}
        <ScrollAnimate id="advocates">
          <AdditionalAdvocates />
        </ScrollAnimate>

        {/* Section 4.5: Peer & Client Endorsements Carousel */}
        <ScrollAnimate id="testimonials">
          <ClientTestimonials />
        </ScrollAnimate>

        {/* Section 4.6: Frequently Asked Questions */}
        <ScrollAnimate id="faq">
          <FAQ />
        </ScrollAnimate>

        {/* Section 4.7: Internship Applications */}
        <ScrollAnimate id="internships">
          <Internships />
        </ScrollAnimate>

        {/* Section 5: Admissions Case Intake Desk */}
        <ScrollAnimate id="contact">
          <Contact />
        </ScrollAnimate>
      </main>

      {/* Footer Navigation & Advertising compliance */}
      <Footer 
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* Floating Utilities */}
      <BackToTop />

      {/* Interactive Modal Booking Dialogue */}
      <ConsultationModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Regulatory Cookie Consent Banner */}
      {!isSplashActive && (
        <CookieConsent 
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      )}

      {/* Legal Protected Disclaimers & Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Client Secure Portal Modal */}
      <UserPortal 
        isOpen={isUserPortalOpen} 
        onClose={() => setIsUserPortalOpen(false)} 
        onOpenConsultation={openModal} 
      />
    </div>
    </>
  );
}
