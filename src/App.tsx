import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import PracticeAreas from "./components/PracticeAreas";
import WhyChooseUs from "./components/WhyChooseUs";
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

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isUserPortalOpen, setIsUserPortalOpen] = useState(false);

  // Monitor URL Hash or Query to open the Admin Portal
  useEffect(() => {
    const checkAdmin = () => {
      if (window.location.hash === "#admin" || window.location.search.includes("admin=true")) {
        setIsAdminOpen(true);
      }
    };

    checkAdmin();
    window.addEventListener("hashchange", checkAdmin);
    return () => window.removeEventListener("hashchange", checkAdmin);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isAdminOpen) {
    return <AdminPortal onClose={() => {
      setIsAdminOpen(false);
      // Clean up the hash safely without a page reload
      if (window.location.hash === "#admin") {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }} />;
  }

  return (
    <>
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

        {/* Section 4.5: Peer & Client Endorsements Carousel */}
        <ScrollAnimate id="testimonials">
          <ClientTestimonials />
        </ScrollAnimate>

        {/* Section 5: Admissions Case Intake Desk */}
        <ScrollAnimate id="contact">
          <Contact />
        </ScrollAnimate>
      </main>

      {/* Footer Navigation & Advertising compliance */}
      <Footer 
        onOpenAdmin={() => setIsAdminOpen(true)} 
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
