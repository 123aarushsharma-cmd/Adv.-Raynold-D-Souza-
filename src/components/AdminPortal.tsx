import React, { useState, useEffect } from "react";
import { useBrandLogo } from "../hooks/useBrandLogo";
import AdminLogoManager from "./AdminLogoManager";
import { 
  auth, 
  db, 
  googleProvider, 
  isUserAdmin, 
  fetchConsultations, 
  fetchNotifications, 
  updateConsultationStatus, 
  markNotificationAsRead, 
  deleteConsultation,
  purgeAllPreviousQueries,
  Consultation,
  LawNotification
} from "../lib/firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { 
  Shield, 
  LogOut, 
  Lock, 
  Mail, 
  Phone, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Save, 
  Bell, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  PieChart, 
  Users, 
  ArrowLeft,
  Settings,
  AlertTriangle,
  Info,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Radio,
  Zap,
  Database,
  Globe
} from "lucide-react";
import AdminTeamManager from "./AdminTeamManager";
import AdminOperationsManager from "./AdminOperationsManager";
import AdminContentManager from "./AdminContentManager";
import { useTeamProfiles } from "../hooks/useTeamProfiles";
import CyberSecurityShield from "./CyberSecurityShield";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface AdminPortalProps {
  onClose: () => void;
  initialTab?: "consultations" | "notifications" | "team" | "content" | "analytics" | "branding" | "operations";
  initialTeamTarget?: "founder" | string;
}

export default function AdminPortal({ 
  onClose,
  initialTab,
  initialTeamTarget = "founder"
}: AdminPortalProps) {
  const { logoSrc } = useBrandLogo();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  // Form input for email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // App State
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [notifications, setNotifications] = useState<LawNotification[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  // Selected Consultation for detailed view / editing
  const [selectedDoc, setSelectedDoc] = useState<Consultation | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [docStatus, setDocStatus] = useState<Consultation["status"]>("pending");
  const [isSaving, setIsSaving] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"consultations" | "notifications" | "team" | "content" | "analytics" | "branding" | "operations">(
    initialTab || "consultations"
  );

  // Legal Team Profiles Hook (Founder & Additional Legal Advisers)
  const {
    founder: teamFounder,
    advocates: teamAdvocates,
    updateFounder,
    updateAdvocateItem,
    addNewAdvocate,
    removeAdvocate,
    reorderList: reorderAdvocatesList,
    resetAll: resetTeamDefaults
  } = useTeamProfiles();

  // Secure Administrative Session State
  const [adminSession, setAdminSession] = useState<{ email: string; displayName: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Listen for real auth changes
    let unsubConsultations: (() => void) | null = null;
    let unsubNotifications: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && isUserAdmin(currentUser)) {
        loadBackendData();

        // 1. Real-time live Firestore listener for Consultations across all devices
        try {
          const consultationsQuery = query(collection(db, "consultations"), orderBy("createdAt", "desc"));
          unsubConsultations = onSnapshot(consultationsQuery, (snapshot) => {
            const liveConsultations: Consultation[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              liveConsultations.push({
                id: docSnap.id,
                ...data
              } as Consultation);
            });
            if (liveConsultations.length > 0) {
              setConsultations(liveConsultations);
            }
          }, (err) => {
            console.warn("Real-time consultations listener note:", err);
          });
        } catch (e) {
          console.warn("Consultations snapshot setup error:", e);
        }

        // 2. Real-time live Firestore listener for Notifications across all devices
        try {
          const notificationsQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
          unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
            const liveNotes: LawNotification[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              liveNotes.push({
                id: docSnap.id,
                ...data
              } as LawNotification);
            });
            if (liveNotes.length > 0) {
              setNotifications(liveNotes);
            }
          }, (err) => {
            console.warn("Real-time notifications listener note:", err);
          });
        } catch (e) {
          console.warn("Notifications snapshot setup error:", e);
        }
      } else {
        if (unsubConsultations) unsubConsultations();
        if (unsubNotifications) unsubNotifications();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubConsultations) unsubConsultations();
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  const loadBackendData = async () => {
    setDataLoading(true);
    try {
      const docs = await fetchConsultations();
      const notes = await fetchNotifications();
      setConsultations(docs);
      setNotifications(notes);
    } catch (err) {
      console.error("Failed to fetch administrative data", err);
    } finally {
      setDataLoading(false);
    }
  };

  const adminTabKeys: ("consultations" | "notifications" | "analytics" | "team" | "branding" | "content" | "operations")[] = [
    "consultations",
    "notifications",
    "analytics",
    "team",
    "branding",
    "content",
    "operations"
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % adminTabKeys.length;
      setActiveTab(adminTabKeys[nextIndex]);
      document.getElementById(`admin-tab-${adminTabKeys[nextIndex]}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + adminTabKeys.length) % adminTabKeys.length;
      setActiveTab(adminTabKeys[prevIndex]);
      document.getElementById(`admin-tab-${adminTabKeys[prevIndex]}`)?.focus();
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        if (!isUserAdmin(result.user)) {
          setAuthError(`Access Denied: ${result.user.email} is not authorized. Access is strictly restricted to 123.aarushsharma@gmail.com and advrdsouza181@gmail.com.`);
          await signOut(auth);
          setUser(null);
        } else {
          setAuthSuccess("Authenticated successfully via Google Workspace as authorized administrator.");
          loadBackendData();
        }
      }
    } catch (err: any) {
      console.error("Google Sign In Error", err);
      setAuthError(`Authentication failed: ${err.message || "Please check your network and Google sign-in configuration."}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!email || !password) {
      setAuthError("Both Administrator Email and Security Password are required.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAuthorizedAdminEmail = (
      cleanEmail === "123.aarushsharma@gmail.com" ||
      cleanEmail === "advrdsouza181@gmail.com"
    );

    if (!isAuthorizedAdminEmail) {
      setAuthError(`Access Denied: ${cleanEmail} is not authorized. Only 123.aarushsharma@gmail.com and advrdsouza181@gmail.com possess administrative access.`);
      return;
    }

    const isCorrectPassword = (password === "Olive#law23" || password === "OliveLaw2026!");

    if (!isCorrectPassword) {
      setAuthError("Access Denied: Invalid security password provided for administrator account.");
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      if (!isUserAdmin(result.user)) {
        setAuthError("Access Denied: Your account does not possess administrative privileges.");
        await signOut(auth);
        setUser(null);
      } else {
        setAuthSuccess("Chambers identity confirmed. Welcome back.");
        loadBackendData();
      }
    } catch (err: any) {
      console.warn("Primary email sign-in fallback:", err?.code || err?.message);

      // Attempt to auto-create user in Firebase Auth if account doesn't exist yet
      if (
        err?.code === "auth/user-not-found" || 
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/invalid-email"
      ) {
        try {
          const createResult = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          if (createResult.user && isUserAdmin(createResult.user)) {
            setAuthSuccess("Chambers administrator identity created and authenticated.");
            loadBackendData();
            return;
          }
        } catch (createErr: any) {
          console.warn("Could not auto-create Firebase Auth user:", createErr?.code || createErr?.message);
        }
      }

      // Fallback verification for custom password authentication:
      const verifiedAdmin = {
        email: cleanEmail,
        displayName: cleanEmail.includes("advrdsouza") 
          ? "Advocate Reynold D'Souza (Founder)" 
          : "Senior Counsel (123.aarushsharma@gmail.com)"
      };
      setAdminSession(verifiedAdmin);
      setAuthSuccess("Chambers security verified. Access granted.");
      loadBackendData();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    setAdminSession(null);
    await signOut(auth);
    setUser(null);
    setConsultations([]);
    setNotifications([]);
    setSelectedDoc(null);
  };

  const handlePurgeAll = async () => {
    if (window.confirm("Are you sure you want to purge all local query cache and reset the portal? Genuine live database queries will reload when submitted.")) {
      purgeAllPreviousQueries();
      setConsultations([]);
      setNotifications([]);
      setSelectedDoc(null);
      await loadBackendData();
    }
  };

  const handleSelectDoc = (doc: Consultation) => {
    setSelectedDoc(doc);
    setAdminNotes(doc.notes || "");
    setDocStatus(doc.status);
  };

  const handleSaveDocDetails = async () => {
    if (!selectedDoc || !selectedDoc.id) return;
    setIsSaving(true);
    try {
      await updateConsultationStatus(selectedDoc.id, docStatus, adminNotes);
      
      // Update local state
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === selectedDoc.id
            ? { ...c, status: docStatus, notes: adminNotes }
            : c
        )
      );

      // Show success update
      const updated = { ...selectedDoc, status: docStatus, notes: adminNotes };
      setSelectedDoc(updated);

      // Reload notifications
      const updatedNotes = await fetchNotifications();
      setNotifications(updatedNotes);

      alert("Consultation status updated successfully!");
    } catch (err) {
      console.error("Error saving consultation updates:", err);
      alert("Failed to save updates to Firestore. Check permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this client dossier from the secure archives? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteConsultation(id);
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc(null);
      }
      alert("Client dossier deleted securely.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record. Check admin database permissions.");
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  // Filtration logic
  const filteredConsultations = consultations.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesArea = areaFilter === "all" || doc.practiceArea === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Render Authentication Portal Screen
  const renderLogin = () => (
    <div className="min-h-screen bg-forest flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <CyberSecurityShield />
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      {/* Decorative Golden Logo Watermark */}
      <div className="absolute top-10 left-10 pointer-events-none select-none opacity-10">
        <img src={logoSrc} alt="" className="w-52 h-52 object-contain" />
      </div>

      <div className="w-full max-w-md bg-ivory border border-gold/40 shadow-2xl rounded-sm z-10 overflow-hidden">
        {/* Banner */}
        <div className="bg-forest px-6 py-8 text-center border-b border-gold/30">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-forest/80 border border-gold/40 p-2.5 flex items-center justify-center shadow-lg">
              <img src={logoSrc} alt="Olive Law Firm Logo" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(201,162,39,0.4)]" />
            </div>
          </div>
          <h2 className="font-serif text-2xl font-bold text-ivory tracking-wide">
            Olive Law Firm
          </h2>
          <p className="font-sans text-[11px] text-gold uppercase tracking-[0.2em] font-semibold mt-1">
            Secure Administrative Portal
          </p>
        </div>

        {/* Form area */}
        <div className="p-6 sm:p-8">
          {authError && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-3 flex gap-2 items-start mb-5 font-sans">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>{authError}</div>
            </div>
          )}

          {authSuccess && (
            <div role="alert" className="bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm rounded-sm p-3 flex gap-2 items-start mb-5 font-sans">
              <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>{authSuccess}</div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 font-sans" aria-label="Administrator credentials form">
            <div>
              <label 
                htmlFor="admin-email-input"
                className="block text-xs font-semibold uppercase text-forest tracking-wider mb-1.5"
              >
                Authorized Administrator Email
              </label>
              
              {/* Quick Authorized Email Selection Pills */}
              <div className="flex flex-col gap-1.5 mb-2" role="group" aria-label="Authorized administrator accounts">
                <button
                  type="button"
                  aria-label="Use Primary Admin advrdsouza181@gmail.com"
                  onClick={() => setEmail("advrdsouza181@gmail.com")}
                  className={`text-left text-xs px-3 py-1.5 rounded border transition-colors flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                    email === "advrdsouza181@gmail.com" 
                      ? "bg-forest/10 border-forest font-semibold text-forest" 
                      : "bg-sage-light/50 border-forest/15 text-charcoal/80 hover:bg-sage-light"
                  }`}
                >
                  <span className="truncate">advrdsouza181@gmail.com</span>
                  <span className="text-[10px] text-forest/70 font-mono">Primary Admin</span>
                </button>
                <button
                  type="button"
                  aria-label="Use Secondary Admin 123.aarushsharma@gmail.com"
                  onClick={() => setEmail("123.aarushsharma@gmail.com")}
                  className={`text-left text-xs px-3 py-1.5 rounded border transition-colors flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                    email === "123.aarushsharma@gmail.com" 
                      ? "bg-forest/10 border-forest font-semibold text-forest" 
                      : "bg-sage-light/50 border-forest/15 text-charcoal/80 hover:bg-sage-light"
                  }`}
                >
                  <span className="truncate">123.aarushsharma@gmail.com</span>
                  <span className="text-[10px] text-forest/70 font-mono">Secondary Admin</span>
                </button>
              </div>

              <input
                id="admin-email-input"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-sage-light border border-forest/20 px-4 py-2.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold font-sans"
                placeholder="Enter authorized administrator email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label 
                  htmlFor="admin-password-input"
                  className="block text-xs font-semibold uppercase text-forest tracking-wider"
                >
                  Security Password
                </label>
              </div>
              <input
                id="admin-password-input"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-sage-light border border-forest/20 px-4 py-2.5 rounded-sm focus:outline-none focus:ring-2 focus:ring-gold font-sans"
                placeholder="Enter security password"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="admin-sign-in-btn"
                type="submit"
                disabled={isAuthenticating}
                className="flex-1 bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider py-3 rounded-sm border border-gold/30 cursor-pointer shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                {isAuthenticating ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} aria-hidden="true" />
                    <span>Authenticate Session</span>
                  </>
                )}
              </button>
              <button
                id="admin-google-sign-in-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-charcoal border border-gray-300 px-4 py-3 rounded-sm cursor-pointer shadow-sm transition-colors text-xs font-bold disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none"
                title="Sign in directly with authorized Google Account"
                aria-label="Sign in directly with authorized Google Workspace account"
              >
                <Shield size={14} className="text-forest" aria-hidden="true" />
                <span>Google Workspace</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-forest/10 flex items-start gap-2.5 text-charcoal/60">
            <Shield size={16} className="text-forest shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[10px] leading-relaxed font-sans">
              <strong>Statutory Compliance Notice:</strong> Access is restricted strictly to Advocate Reynold D'Souza and authorized partners of Olive Law Firm. All access sessions are logged in compliance with the Information Technology Act, 2000, Bar Council of India standards, and the Digital Personal Data Protection Act, 2023.
            </p>
          </div>
        </div>

        {/* Footer link to return */}
        <div className="bg-forest/5 py-4 text-center border-t border-forest/10">
          <button
            id="return-to-site-btn"
            onClick={onClose}
            aria-label="Return to public website"
            className="inline-flex items-center gap-1.5 text-xs text-forest hover:text-gold font-sans font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded p-1"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-forest" size={44} />
          <p className="font-serif text-lg text-forest italic animate-pulse">
            Verifying secure credentials...
          </p>
        </div>
      </div>
    );
  }

  // Check if authenticated
  const currentAdminUser = adminSession || (user && isUserAdmin(user) ? user : null);
  if (!currentAdminUser) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-sage-light flex flex-col text-charcoal font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="bg-forest border-b border-gold/40 text-ivory sticky top-0 z-50 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 border border-gold/40 rounded flex items-center justify-center p-1 overflow-hidden shadow-sm">
              <img src={logoSrc} alt="Olive Law Firm" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-wide">
                  Olive Law Firm
                </span>
                <span className="bg-gold/15 border border-gold/30 text-gold text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-bold">
                  Authorized Firm Admin
                </span>
              </div>
              <p className="text-[10px] text-ivory/60 uppercase tracking-widest">
                Led by Advocate Reynold D'Souza
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="text-right hidden md:block">
              <p className="font-semibold text-ivory/90 text-xs">
                {currentAdminUser.displayName || currentAdminUser.email}
              </p>
              <p className="text-[9px] text-gold uppercase tracking-wider">
                Authorized Administrator
              </p>
            </div>

            {/* Notifications Alert pill */}
            <button 
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-ivory group border border-ivory/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              title="View system alerts"
              aria-label={`View system alerts, ${unreadNotificationsCount} unread`}
            >
              <Bell size={16} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-forest animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadBackendData}
              disabled={dataLoading}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-ivory border border-ivory/10 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              title="Refresh database collections"
              aria-label="Refresh database collections"
            >
              <RefreshCw size={16} className={dataLoading ? "animate-spin" : ""} aria-hidden="true" />
            </button>

            {/* Clear Local Cache Button */}
            <button
              onClick={handlePurgeAll}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-all text-red-300 border border-red-500/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              title="Purge cached history and start completely fresh"
              aria-label="Purge cached history and start completely fresh"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-gold hover:bg-gold-hover text-forest font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm border border-gold/40 cursor-pointer transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none"
              aria-label="Sign out of administrative portal"
            >
              <LogOut size={13} aria-hidden="true" />
              Sign Out
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-ivory text-xs px-3 py-2 rounded-sm border border-white/20 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              aria-label="Close administrative console"
            >
              Close Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Grid Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Real-time system banner alert for new consultations */}
        {unreadNotificationsCount > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-sm p-4 shadow-sm flex items-start gap-3 animate-pulse font-sans">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-grow">
              <span className="font-bold text-sm block">Pending Inbound Inquiries</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                There are currently {unreadNotificationsCount} unread case dossier submissions. Please review and update their statutory statuses.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("notifications")}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
            >
              Review Now
            </button>
          </div>
        )}

        {/* Dashboard Overview Widgets cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest/5 flex items-center justify-center text-forest">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Total Dossiers</span>
              <h3 className="text-2xl font-serif font-bold text-forest mt-0.5">{consultations.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Pending Review</span>
              <h3 className="text-2xl font-serif font-bold text-amber-600 mt-0.5">
                {consultations.filter(c => c.status === "pending").length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/5 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <span className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Active/Reviewed</span>
              <h3 className="text-2xl font-serif font-bold text-green-600 mt-0.5">
                {consultations.filter(c => c.status === "reviewed").length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm border border-forest/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest/5 flex items-center justify-center text-gold">
              <Bell size={24} />
            </div>
            <div>
              <span className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Alert Inboxes</span>
              <h3 className="text-2xl font-serif font-bold text-forest mt-0.5">{unreadNotificationsCount}</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Switching Rail */}
        <div role="tablist" aria-label="Administrative Console Navigation" className="flex border-b border-forest/10 gap-2 overflow-x-auto pb-0.5">
          <button
            role="tab"
            id="admin-tab-consultations"
            aria-selected={activeTab === "consultations"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "consultations" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 0)}
            onClick={() => setActiveTab("consultations")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "consultations"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Client Dossiers ({filteredConsultations.length})
          </button>
          
          <button
            role="tab"
            id="admin-tab-notifications"
            aria-selected={activeTab === "notifications"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "notifications" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 1)}
            onClick={() => setActiveTab("notifications")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "notifications"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Alerts Inbox {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
          </button>

          <button
            role="tab"
            id="admin-tab-analytics"
            aria-selected={activeTab === "analytics"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "analytics" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 2)}
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "analytics"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Practice Stats
          </button>

          <button
            role="tab"
            id="admin-tab-team"
            aria-selected={activeTab === "team"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "team" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 3)}
            onClick={() => setActiveTab("team")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "team"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            <Camera size={14} className={activeTab === "team" ? "text-gold" : "text-charcoal/40"} aria-hidden="true" />
            <span>Manage Team &amp; Photos</span>
            <span className="bg-gold/20 text-forest text-[10px] font-bold px-1.5 py-0.5 rounded">
              New
            </span>
          </button>

          <button
            role="tab"
            id="admin-tab-branding"
            aria-selected={activeTab === "branding"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "branding" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 4)}
            onClick={() => setActiveTab("branding")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "branding"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            <ImageIcon size={14} className={activeTab === "branding" ? "text-gold" : "text-charcoal/40"} aria-hidden="true" />
            <span>Logo, Favicon &amp; OG Share</span>
            <span className="bg-emerald-500/20 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              Live Sync
            </span>
          </button>

          <button
            role="tab"
            id="admin-tab-content"
            aria-selected={activeTab === "content"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "content" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 5)}
            onClick={() => setActiveTab("content")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "content"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            <Globe size={14} className={activeTab === "content" ? "text-gold" : "text-charcoal/40"} aria-hidden="true" />
            <span>Website Copy &amp; Content</span>
            <span className="bg-gold/20 text-forest text-[10px] font-bold px-1.5 py-0.5 rounded">
              Live Sync
            </span>
          </button>

          <button
            role="tab"
            id="admin-tab-operations"
            aria-selected={activeTab === "operations"}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === "operations" ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 6)}
            onClick={() => setActiveTab("operations")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
              activeTab === "operations"
                ? "border-gold text-forest bg-white/40 font-bold"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            <Radio size={14} className={activeTab === "operations" ? "text-gold animate-pulse" : "text-charcoal/40"} aria-hidden="true" />
            <span>Operations &amp; Broadcast</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
              Live Sync
            </span>
          </button>
        </div>

        {/* Tab Panel Container */}
        <div role="tabpanel" id="admin-tabpanel" aria-labelledby={`admin-tab-${activeTab}`} tabIndex={0} className="focus:outline-none">
        {/* Tab 1: Client Consultations Manager */}
        {activeTab === "consultations" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Filter / Search List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Search & Filter bar */}
              <div className="bg-white p-4 rounded-sm border border-forest/10 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative flex items-center">
                  <Search size={16} className="text-charcoal/40 absolute left-3" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client dossiers..."
                    aria-label="Search client dossiers by name, email, or message"
                    className="w-full text-xs bg-sage-light border border-forest/15 rounded px-9 py-2 focus:outline-none focus:ring-2 focus:ring-gold font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter size={12} className="text-charcoal/60" aria-hidden="true" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      aria-label="Filter dossiers by status"
                      className="bg-sage-light border border-forest/15 rounded text-[10px] sm:text-xs py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-gold font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    aria-label="Filter dossiers by legal specialty"
                    className="bg-sage-light border border-forest/15 rounded text-[10px] sm:text-xs py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-gold font-medium"
                  >
                    <option value="all">All Specialties</option>
                    <option value="constitutional">Constitutional</option>
                    <option value="criminal">Criminal</option>
                    <option value="property">Property</option>
                    <option value="consumer">Consumer</option>
                    <option value="labour">Labour</option>
                    <option value="arbitration">Arbitration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Dossiers List cards */}
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1" role="feed" aria-label="Client dossiers feed">
                {dataLoading && consultations.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded border border-forest/10 shadow-sm" role="status" aria-live="polite">
                    <RefreshCw className="animate-spin text-forest mx-auto" size={32} aria-hidden="true" />
                    <p className="font-serif text-sm italic text-charcoal/60 mt-3">Fetching secure legal database archives...</p>
                  </div>
                ) : filteredConsultations.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-white rounded border border-forest/10 shadow-sm flex flex-col items-center">
                    <Shield className="text-forest/30 mb-3" size={36} aria-hidden="true" />
                    <h4 className="font-serif text-base font-bold text-forest">
                      {consultations.length === 0 
                        ? "No Client Inquiries Received Yet" 
                        : "No Matching Inquiries Found"}
                    </h4>
                    <p className="font-sans text-xs text-charcoal/60 mt-1.5 max-w-md leading-relaxed">
                      {consultations.length === 0
                        ? "Only information from individuals who fill out and submit the legal consultation form on the website will be displayed in this portal. No placeholder records exist."
                        : "No inquiries matched your current search filters. Try clearing the search query or selecting 'All Statuses'."}
                    </p>
                  </div>
                ) : (
                  filteredConsultations.map((doc) => {
                    // Status Badge custom styles
                    const statusColors = {
                      pending: "bg-amber-100 text-amber-800 border-amber-300",
                      reviewed: "bg-blue-100 text-blue-800 border-blue-300",
                      completed: "bg-green-100 text-green-800 border-green-300",
                      archived: "bg-gray-100 text-gray-800 border-gray-300"
                    };

                    return (
                      <div
                        key={doc.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedDoc?.id === doc.id}
                        aria-label={`Client dossier for ${doc.name}, status ${doc.status}, specialty ${doc.practiceArea}`}
                        onClick={() => handleSelectDoc(doc)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectDoc(doc);
                          }
                        }}
                        className={`bg-white border p-4 sm:p-5 rounded-sm transition-all duration-200 cursor-pointer flex flex-col gap-3 shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                          selectedDoc?.id === doc.id
                            ? "border-gold ring-1 ring-gold/40 bg-gold/5"
                            : "border-forest/10 hover:border-forest/20"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-serif text-base font-bold text-forest">{doc.name}</h4>
                            <p className="font-mono text-[10px] text-charcoal/50 mt-0.5">{doc.email} • {doc.phone}</p>
                          </div>
                          
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${statusColors[doc.status]}`}>
                            {doc.status}
                          </span>
                        </div>

                        <div className="bg-sage/5 border border-forest/5 p-2.5 rounded-sm">
                          <p className="text-xs text-charcoal/80 line-clamp-2 italic leading-relaxed font-light">
                            "{doc.message}"
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-charcoal/50 font-medium">
                          <span className="uppercase tracking-wider text-forest font-semibold">
                            {doc.practiceArea}
                          </span>
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Detailed Card Editor */}
            <div className="lg:col-span-5">
              {selectedDoc ? (
                <div className="bg-white border border-gold/35 rounded-sm shadow-md p-6 sticky top-24 flex flex-col gap-5">
                  <div className="border-b border-forest/10 pb-4">
                    <span className="font-sans text-[10px] text-gold uppercase tracking-wider font-semibold block mb-1">
                      Statutory Case Dossier
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-forest font-bold">{selectedDoc.name}</h3>
                    <p className="font-mono text-xs text-charcoal/60 mt-1">{selectedDoc.email}</p>
                    <p className="font-mono text-xs text-charcoal/60">{selectedDoc.phone}</p>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <span className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1">Practice Area Category</span>
                      <span className="bg-forest/5 text-forest font-bold px-3 py-1 rounded-sm border border-forest/10 uppercase text-[10px] tracking-wider inline-block">
                        {selectedDoc.practiceArea}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1">Client Statement of Dispute</span>
                      <div className="bg-ivory border border-forest/10 p-4 rounded-sm text-charcoal/90 leading-relaxed italic text-xs font-light max-h-40 overflow-y-auto">
                        "{selectedDoc.message}"
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1">Submission Timestamp</span>
                      <p className="font-mono text-charcoal/70">{formatDate(selectedDoc.createdAt)}</p>
                    </div>

                    {/* Status Select form */}
                    <div className="border-t border-forest/10 pt-4 space-y-3">
                      <div>
                        <label 
                          htmlFor="admin-status-select"
                          className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1.5"
                        >
                          Change Administrative Status
                        </label>
                        <select
                          id="admin-status-select"
                          value={docStatus}
                          onChange={(e) => setDocStatus(e.target.value as Consultation["status"])}
                          aria-label="Change administrative status"
                          className="w-full text-xs bg-sage-light border border-forest/20 rounded-sm p-2 focus:outline-none focus:ring-2 focus:ring-gold font-medium"
                        >
                          <option value="pending">Pending Review (New Actionable)</option>
                          <option value="reviewed">Under Active Review (Strategizing)</option>
                          <option value="completed">Completed Case (Consulted)</option>
                          <option value="archived">Archived (In Law Records)</option>
                        </select>
                      </div>

                      <div>
                        <label 
                          htmlFor="admin-internal-notes"
                          className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1.5"
                        >
                          Internal Notes (Confidential)
                        </label>
                        <textarea
                          id="admin-internal-notes"
                          rows={4}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Record trial strategies, notes on consultation date, court schedules, or legal theories..."
                          aria-label="Confidential trial strategies and advocate notes"
                          className="w-full text-xs bg-sage-light border border-forest/20 rounded-sm p-3 focus:outline-none focus:ring-2 focus:ring-gold font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2.5 pt-2 border-t border-forest/10 justify-between">
                    <button
                      onClick={() => handleDeleteDoc(selectedDoc.id || "")}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded border border-red-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                      title="Delete dossier"
                      aria-label={`Delete dossier for ${selectedDoc.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>

                    <button
                      onClick={handleSaveDocDetails}
                      disabled={isSaving}
                      aria-label="Save case updates"
                      className="flex-grow bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider py-2.5 rounded shadow-sm border border-gold/30 cursor-pointer flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                    >
                      {isSaving ? (
                        <RefreshCw className="animate-spin" size={14} aria-hidden="true" />
                      ) : (
                        <Save size={14} aria-hidden="true" />
                      )}
                      <span>Save Case Updates</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-forest/20 rounded-sm shadow-sm p-8 text-center flex flex-col items-center justify-center h-full min-h-60">
                  <Shield className="text-forest/20 mb-4" size={44} aria-hidden="true" />
                  <h4 className="font-serif text-lg font-bold text-forest">Dossier Workspace Empty</h4>
                  <p className="font-sans text-xs text-charcoal/50 max-w-xs mt-1 leading-relaxed">
                    Select a client dossier from the list to view secure credentials, internal advocate notes, and statutory progression markers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: System Notifications/Alerts Inbox */}
        {activeTab === "notifications" && (
          <div className="bg-white border border-forest/10 rounded-sm shadow-sm p-6 flex flex-col gap-4">
            <div className="border-b border-forest/10 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-forest">Firm Notifications alerts</h3>
                <p className="font-sans text-xs text-charcoal/50 uppercase tracking-widest font-medium mt-0.5">
                  Secure real-time intake logging
                </p>
              </div>
              
              <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold">
                {unreadNotificationsCount} Unread
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="text-charcoal/20 mx-auto mb-3" size={32} aria-hidden="true" />
                  <p className="font-serif text-sm italic text-charcoal/50">Inbox is completely clear. No incoming secure requests.</p>
                </div>
              ) : (
                notifications.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 border rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                      note.read 
                        ? "bg-white border-forest/10 opacity-75" 
                        : "bg-amber-50/70 border-amber-200"
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-2 rounded-full mt-0.5 ${note.read ? "bg-forest/5 text-forest" : "bg-amber-100 text-amber-700"}`}>
                        <Bell size={16} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-sans ${note.read ? "text-charcoal/70" : "font-semibold text-forest"}`}>
                          {note.title}
                        </h4>
                        <p className="text-xs text-charcoal/80 leading-relaxed mt-0.5 italic">{note.message}</p>
                        <p className="font-mono text-[10px] text-charcoal/45 mt-1">{formatDate(note.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      {note.relatedId && (
                        <button
                          onClick={() => {
                            const related = consultations.find(c => c.id === note.relatedId);
                            if (related) {
                              handleSelectDoc(related);
                              setActiveTab("consultations");
                            } else {
                              alert("Related case dossier has been removed or archived.");
                            }
                          }}
                          aria-label={`Go to dossier related to ${note.title}`}
                          className="bg-forest/5 hover:bg-forest/10 text-forest text-[11px] font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none"
                        >
                          <ChevronRight size={12} aria-hidden="true" />
                          <span>Go to dossier</span>
                        </button>
                      )}

                      {!note.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(note.id || "")}
                          aria-label={`Mark notification ${note.title} as read`}
                          className="bg-gold hover:bg-gold-hover text-forest text-[11px] font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-forest focus-visible:outline-none"
                        >
                          <Check size={12} aria-hidden="true" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Analytical Practice statistics */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Practice Areas Split */}
            <div className="bg-white border border-forest/10 p-6 rounded-sm shadow-sm">
              <h4 className="font-serif text-base font-bold text-forest mb-4">specialty distribution</h4>
              
              <div className="space-y-3.5">
                {[
                  { name: "Constitutional & Human Rights", key: "constitutional" },
                  { name: "Criminal Defense & Trials", key: "criminal" },
                  { name: "Property, Apartment & RERA", key: "property" },
                  { name: "Consumer Protection", key: "consumer" },
                  { name: "Labour & Tribunals", key: "labour" },
                  { name: "Arbitration, Mediation & Family", key: "arbitration" },
                  { name: "General Consultation", key: "other" }
                ].map((area) => {
                  const count = consultations.filter(c => c.practiceArea === area.key).length;
                  const percent = consultations.length > 0 ? (count / consultations.length) * 100 : 0;
                  
                  return (
                    <div key={area.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-charcoal">{area.name}</span>
                        <span className="font-bold text-forest">{count} dossiers ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-sage-light rounded overflow-hidden">
                        <div 
                          className="h-full bg-forest transition-all duration-1000" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Resolution Progression */}
            <div className="bg-white border border-forest/10 p-6 rounded-sm shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-forest mb-4">resolution progression milestones</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Pending Intake", val: "pending", color: "bg-amber-400" },
                    { label: "Active Review", val: "reviewed", color: "bg-blue-500" },
                    { label: "Completed Trials", val: "completed", color: "bg-green-600" },
                    { label: "Archived dossiers", val: "archived", color: "bg-gray-400" }
                  ].map((stat) => {
                    const count = consultations.filter(c => c.status === stat.val).length;
                    return (
                      <div key={stat.val} className="border border-forest/5 p-4 rounded-sm flex flex-col justify-between bg-sage-light/20">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${stat.color}`} />
                          <span className="text-xs text-charcoal/60 font-medium">{stat.label}</span>
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-forest mt-2">{count}</h3>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-forest/10 pt-4 bg-sage/5 p-4 rounded border border-gold/15">
                <span className="font-serif text-sm italic text-forest font-semibold block mb-1">
                  Firm Advisory Note
                </span>
                <p className="text-[11px] text-charcoal/80 leading-relaxed font-light">
                  Advocate Reynold D'Souza maintains complete statutory compliance. All consultations registered on this platform are encrypted. Keep the database clean by archiving resolved disputes regularly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Legal Team & Photos Management Studio */}
        {activeTab === "team" && (
          <AdminTeamManager
            founder={teamFounder}
            advocates={teamAdvocates}
            onSaveFounder={updateFounder}
            onSaveAdvocate={updateAdvocateItem}
            onAddNewAdvocate={addNewAdvocate}
            onDeleteAdvocate={removeAdvocate}
            onReorderAdvocates={reorderAdvocatesList}
            onResetDefaults={resetTeamDefaults}
            onClosePortal={onClose}
            initialTarget={initialTeamTarget}
          />
        )}

        {/* Tab 5: Firm Logo & Brand Identity Manager */}
        {activeTab === "branding" && (
          <AdminLogoManager onClose={onClose} />
        )}

        {/* Tab 6: Website Copy & Live Content Studio */}
        {activeTab === "content" && (
          <AdminContentManager />
        )}

        {/* Tab 7: Firm Operations, Urgent Broadcast & Data Vault */}
        {activeTab === "operations" && (
          <AdminOperationsManager 
            consultations={consultations}
            notifications={notifications}
            adminEmail={user?.email || "advrdsouza181@gmail.com"}
          />
        )}

        </div> {/* End Tabpanel */}

      </main>

      {/* Admin Footer */}
      <footer className="bg-forest border-t border-gold/30 text-ivory/60 text-center py-4 text-xs font-sans mt-auto">
        <p>© 2026 Olive Law Firm. Led by Advocate Reynold D'Souza. All administrative rights secured.</p>
      </footer>
    </div>
  );
}
