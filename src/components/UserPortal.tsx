import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle, 
  User, 
  Scale, 
  Briefcase, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { 
  auth, 
  googleProvider, 
  fetchUserConsultations, 
  Consultation 
} from "../lib/firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";

interface UserPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConsultation: () => void;
}

export default function UserPortal({ isOpen, onClose, onOpenConsultation }: UserPortalProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Consultation[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Consultation | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        loadUserCases();
      } else {
        setCases([]);
        setSelectedCase(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserCases = async () => {
    setCasesLoading(true);
    try {
      const userCases = await fetchUserConsultations();
      setCases(userCases);
      if (userCases.length > 0 && !selectedCase) {
        setSelectedCase(userCases[0]);
      }
    } catch (err) {
      console.error("Error loading user cases:", err);
    } finally {
      setCasesLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google login error:", err);
      setAuthError(err.message || "Failed to establish a secure connection.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getStatusBadge = (status: Consultation["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={11} />
            <span>Under Review</span>
          </span>
        );
      case "reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Scale size={11} />
            <span>Statutory Review</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle size={11} />
            <span>Counsel Active</span>
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-semibold tracking-wider uppercase bg-gray-500/10 text-gray-500 border border-gray-500/20">
            <Briefcase size={11} />
            <span>Resolved</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/85 backdrop-blur-sm"
          />

          {/* Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-ivory border border-gold/40 shadow-2xl rounded-sm max-w-4xl w-full max-h-[85vh] overflow-hidden z-10 flex flex-col font-sans"
            id="user-portal-modal"
          >
            {/* Header */}
            <div className="bg-forest text-ivory px-6 py-4.5 flex items-center justify-between border-b border-gold/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-gold" size={22} />
                <div>
                  <h3 className="font-display text-sm tracking-[0.12em] text-ivory uppercase font-semibold">
                    Client Secure Desk
                  </h3>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-medium -mt-0.5">
                    Attorny-Client Privilege Crypt-Verified
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-ivory/60 hover:text-gold transition-colors p-1.5 hover:bg-white/5 rounded-sm cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core Body */}
            <div className="flex-1 overflow-y-auto min-h-[400px]">
              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-3 text-forest/70">
                  <RefreshCw size={24} className="animate-spin text-gold" />
                  <span className="text-xs font-medium uppercase tracking-wider">Establishing Safe Session...</span>
                </div>
              ) : !currentUser ? (
                /* GUEST / LOG IN STATE */
                <div className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto text-center h-full">
                  <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-6">
                    <Scale size={28} />
                  </div>
                  <h4 className="font-serif text-2xl text-forest font-semibold leading-snug">
                    Enter Secure Consultation Desk
                  </h4>
                  <p className="text-xs text-charcoal/70 leading-relaxed mt-2.5 mb-8">
                    To maintain absolute professional confidentiality and log file persistence under the **Digital Personal Data Protection Act (DPDPA), 2023**, authenticate with Google. You can submit briefs and inspect statutory action reviews directly.
                  </p>

                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-sm flex items-start gap-2.5 mb-6 text-left w-full">
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-700 leading-normal">{authError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-forest hover:bg-forest-light text-white font-semibold py-3.5 px-5 rounded-sm border border-gold/20 shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wider"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Secure Sign In with Google</span>
                  </button>
                  
                  <div className="mt-8 flex items-center gap-1.5 text-[9px] tracking-widest uppercase font-semibold text-charcoal/40">
                    <span>256-Bit SSL Encrypted Protocol</span>
                  </div>
                </div>
              ) : (
                /* AUTHENTICATED STATE */
                <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-[500px]">
                  
                  {/* Left Column: Profile Card and Case Index List */}
                  <div className="md:col-span-5 border-r border-gold/20 flex flex-col bg-sage/5">
                    
                    {/* User Profile Summary */}
                    <div className="p-4.5 bg-forest-light/10 border-b border-gold/15 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt={currentUser.displayName || "Client"} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full border border-gold/30 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
                            <User size={18} />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">Verified Client</span>
                          <span className="font-serif text-sm font-semibold text-forest block truncate -mt-0.5">
                            {currentUser.displayName || "Advocate's Client"}
                          </span>
                          <span className="text-[10px] text-charcoal/60 block truncate -mt-0.5">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 text-charcoal/45 hover:text-red-600 rounded-sm hover:bg-red-500/5 transition-all duration-150 cursor-pointer"
                        title="Secure Logout"
                      >
                        <LogOut size={15} />
                      </button>
                    </div>

                    {/* Active Cases / Bookings Header */}
                    <div className="px-4 py-3 bg-white/60 border-b border-gold/10 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-forest">
                        Case Records ({cases.length})
                      </span>
                      <button
                        onClick={loadUserCases}
                        className="text-gold hover:text-forest transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <RefreshCw size={10} className={casesLoading ? "animate-spin" : ""} />
                        <span>Sync</span>
                      </button>
                    </div>

                    {/* Cases List */}
                    <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-[none] divide-y divide-gold/10">
                      {casesLoading && cases.length === 0 ? (
                        <div className="p-8 text-center text-xs text-charcoal/50 uppercase tracking-wider">
                          Synchronizing Dossiers...
                        </div>
                      ) : cases.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-xs text-charcoal/60 leading-relaxed font-light">
                            No active case briefing registers recorded under this profile.
                          </p>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenConsultation();
                            }}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold text-forest hover:text-forest font-bold rounded-sm border border-gold/25 transition-all text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <span>Draft Briefing Register</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      ) : (
                        cases.map((c) => {
                          const isSelected = selectedCase?.id === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedCase(c)}
                              className={`w-full text-left p-4 transition-all duration-150 flex flex-col gap-2.5 border-l-2 cursor-pointer ${
                                isSelected 
                                  ? "bg-gold/10 border-gold/80" 
                                  : "bg-transparent border-transparent hover:bg-gold/5"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-serif text-xs font-semibold text-forest line-clamp-1">
                                  {c.practiceArea.toUpperCase()} PRACTICE AREA
                                </span>
                                <span className="shrink-0">
                                  {getStatusBadge(c.status)}
                                </span>
                              </div>
                              <p className="text-[11px] text-charcoal/70 line-clamp-2 leading-relaxed">
                                {c.message}
                              </p>
                              <div className="flex items-center justify-between text-[9px] text-charcoal/45 font-mono uppercase">
                                <span>ID: {c.id?.substring(0, 8)}...</span>
                                <span>
                                  {c.createdAt 
                                    ? (c.createdAt.seconds 
                                        ? new Date(c.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                                        : new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }))
                                    : "Recent"}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Case Case Details */}
                  <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white overflow-y-auto">
                    {selectedCase ? (
                      <div className="space-y-6">
                        {/* Selected Title */}
                        <div className="border-b border-gold/20 pb-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText size={16} className="text-gold" />
                            <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Intake Record Dossier</span>
                          </div>
                          <h4 className="font-serif text-xl font-bold text-forest leading-snug">
                            {selectedCase.practiceArea.replace("-", " ").toUpperCase()} CONSULTATION
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-charcoal/60">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                              <span>Status:</span>
                              <strong>{selectedCase.status.toUpperCase()}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                              <span>Ref: {selectedCase.id}</span>
                            </span>
                          </div>
                        </div>

                        {/* Submitted Details */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gold block mb-1">Brief Summary Description</span>
                            <div className="bg-sage/5 border border-forest/5 p-4 rounded-sm text-xs text-charcoal/80 leading-relaxed font-light">
                              {selectedCase.message}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-gold block mb-1">Declared Name</span>
                              <span className="text-xs font-semibold text-forest block">{selectedCase.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider font-bold text-gold block mb-1">Secure Contact</span>
                              <span className="text-xs font-medium text-charcoal/80 block">{selectedCase.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Advocate remarks - Essential Legal Core */}
                        <div className="bg-forest/5 border border-gold/30 p-5 rounded-sm space-y-3.5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl filter -mr-5 -mt-5" />
                          <div className="flex items-center gap-2 relative z-10">
                            <div className="w-6 h-6 rounded-sm bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                              <MessageSquare size={12} />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-forest">
                              Advocate Remarks & Orders
                            </span>
                          </div>
                          
                          {selectedCase.notes ? (
                            <p className="font-serif text-sm text-forest leading-relaxed italic pr-4 relative z-10">
                              "{selectedCase.notes}"
                            </p>
                          ) : (
                            <div className="space-y-1 relative z-10">
                              <p className="text-xs text-charcoal/50 italic">
                                Intake briefing registered under initial security assessment. No statutory remarks or directions have been entered by Advocate Reynold D'Souza yet.
                              </p>
                              <p className="text-[10px] text-gold font-medium">
                                Estimated feedback latency: 12-24 Hours.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* DPDPA/Confidentiality Footer */}
                        <div className="border-t border-gold/15 pt-4 text-[10px] text-charcoal/50 leading-relaxed font-light flex items-start gap-2">
                          <ShieldCheck size={14} className="text-gold shrink-0 mt-0.5" />
                          <span>
                            This dossier is encrypted and subject to Attorney-Client privilege under Section 126 of the Indian Evidence Act. Telemetry transactions are logged for statutory compliance.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-charcoal/40">
                        <Scale size={32} className="text-gold/50 mb-3" />
                        <p className="text-xs font-light">Select a dossier on the left panel to inspect legal records and status remarks.</p>
                      </div>
                    )}

                    {/* Quick submit action at bottom right if they have other issues */}
                    <div className="border-t border-gold/15 mt-6 pt-4 flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenConsultation();
                        }}
                        className="btn-gold px-4 py-2 text-[10px] uppercase tracking-wider font-bold rounded-sm shadow-md cursor-pointer hover:brightness-105 transition-all flex items-center gap-1.5"
                      >
                        <span>Submit New Brief</span>
                        <ExternalLink size={11} className="text-forest" />
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
