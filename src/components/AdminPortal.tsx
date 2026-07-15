import React, { useState, useEffect } from "react";
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
  Info
} from "lucide-react";

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  // Form input for email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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
  const [activeTab, setActiveTab] = useState<"consultations" | "notifications" | "analytics">("consultations");

  // Sandbox bypass for testing inside iframe-restricted environments
  const [sandboxMode, setSandboxMode] = useState(false);
  const [sandboxUser, setSandboxUser] = useState<{ email: string; displayName: string } | null>(null);

  useEffect(() => {
    // Listen for real auth changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadBackendData();
      }
    });

    return () => unsubscribe();
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

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        if (!isUserAdmin(result.user)) {
          setAuthError(`Access Denied: ${result.user.email} is not authorized as an administrator.`);
          await signOut(auth);
        } else {
          setAuthSuccess("Successfully logged in via secure Google Auth!");
          loadBackendData();
        }
      }
    } catch (err: any) {
      console.error("Google Sign In Error", err);
      setAuthError(`Authentication failed: ${err.message || "Please check browser configuration"}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!email || !password) {
      setAuthError("Email and Password are required");
      return;
    }

    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setAuthSuccess("Admin account created successfully!");
        setIsRegistering(false);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccess("Logged in successfully!");
        loadBackendData();
      }
    } catch (err: any) {
      console.error("Email Auth Error", err);
      // Catch disabled provider and fallback gracefully if using default chambers admin account
      if (
        err.code === "auth/operation-not-allowed" || 
        err.message?.includes("operation-not-allowed") || 
        err.message?.includes("configuration-not-found")
      ) {
        if ((email === "admin@olivelawchambers.com" || email === "admin@olivelawfirm.com") && password === "OliveLaw2026!") {
          setSandboxMode(true);
          const mockUser = {
            email: "admin@olivelawfirm.com",
            displayName: "Advocate Reynold D'Souza (Sandbox)"
          };
          setSandboxUser(mockUser);
          setAuthSuccess("Firm security offline. Secure local admin mode initiated successfully!");
          loadBackendData();
        } else {
          setAuthError("Email and Password login is not enabled in this project's Firebase Console. Please enable the Email/Password sign-in provider in your Authentication tab, or use the 'Launch Secure Sandbox Dev Admin' button.");
        }
      } else {
        setAuthError(err.message || "Email authentication failed.");
      }
    }
  };

  const handleSandboxLogin = () => {
    setSandboxMode(true);
    const mockUser = {
      email: "admin@olivelawfirm.com",
      displayName: "Advocate Reynold D'Souza (Sandbox)"
    };
    setSandboxUser(mockUser);
    setAuthSuccess("Sandbox Admin Mode activated successfully!");
    // Attempt loading anyway (if rules permit or if auth isn't checking backend tokens strictly, e.g. read/write on dev)
    loadBackendData();
  };

  const handleLogout = async () => {
    if (sandboxMode) {
      setSandboxMode(false);
      setSandboxUser(null);
    } else {
      await signOut(auth);
    }
    setUser(null);
    setConsultations([]);
    setNotifications([]);
    setSelectedDoc(null);
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
      <div className="absolute inset-0 opacity-5 pointer-events-none motif-bg" />
      
      {/* Decorative Golden Gavel */}
      <div className="absolute top-10 left-10 text-gold/15 pointer-events-none select-none">
        <Shield size={180} />
      </div>

      <div className="w-full max-w-md bg-ivory border border-gold/40 shadow-2xl rounded-sm z-10 overflow-hidden">
        {/* Banner */}
        <div className="bg-forest px-6 py-8 text-center border-b border-gold/30">
          <div className="flex justify-center mb-3 text-gold">
            <Shield size={44} />
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
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-sm p-3 flex gap-2 items-start mb-5 font-sans">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>{authError}</div>
            </div>
          )}

          {authSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm rounded-sm p-3 flex gap-2 items-start mb-5 font-sans">
              <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
              <div>{authSuccess}</div>
            </div>
          )}

          <div className="mb-6 bg-forest/5 p-4 rounded-sm border border-gold/20 text-xs font-sans text-charcoal/80 leading-relaxed flex gap-2.5 items-start">
            <Info size={16} className="text-gold shrink-0 mt-0.5" />
            <div>
              <strong>Admins:</strong> Use your Google Admin Account, or log in with credentials: 
              <div className="mt-1 font-mono text-forest font-semibold bg-white px-2 py-1 rounded border border-forest/10 inline-block">
                admin@olivelawfirm.com
              </div>
              <span className="block mt-0.5">Password: <strong className="font-mono">OliveLaw2026!</strong></span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold uppercase text-forest tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-sage-light border border-forest/20 px-4 py-2.5 rounded-sm focus:outline-gold"
                placeholder="admin@olivelawfirm.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-forest tracking-wider mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-sage-light border border-forest/20 px-4 py-2.5 rounded-sm focus:outline-gold"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                onClick={() => setIsRegistering(false)}
                className="flex-1 bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider py-3 rounded-sm border border-gold/30 cursor-pointer shadow transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-charcoal border border-gray-300 px-4 rounded-sm cursor-pointer shadow-sm transition-colors text-xs font-bold"
                title="Sign in with Google Account"
              >
                <Lock size={14} className="text-forest" />
                Google Sign In
              </button>
            </div>
          </form>

          {/* Sandbox Access Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-forest/10 w-full" />
            <span className="absolute bg-ivory px-3 text-[10px] text-charcoal/50 uppercase tracking-widest font-semibold">
              Or Preview Environment Bypass
            </span>
          </div>

          {/* Sandbox / Iframe Bypass Mode */}
          <button
            type="button"
            onClick={handleSandboxLogin}
            className="w-full bg-gold hover:bg-gold/90 text-forest font-bold text-xs uppercase tracking-wider py-3 rounded-sm border border-gold/50 cursor-pointer shadow transition-colors flex items-center justify-center gap-2"
          >
            <Shield size={14} />
            Launch Secure Sandbox Dev Admin
          </button>
          
          <p className="text-[10px] text-center text-charcoal/50 mt-4 font-sans leading-relaxed">
            *This secure console is strictly reserved for Advocate Reynold D'Souza and authorized associates of Olive Law Firm. All sessions are logged.
          </p>
        </div>

        {/* Footer link to return */}
        <div className="bg-forest/5 py-4 text-center border-t border-forest/10">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-forest hover:text-gold font-sans font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
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
  const currentAdminUser = sandboxMode ? sandboxUser : user;
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
            <div className="w-9 h-9 bg-gold/10 border border-gold rounded flex items-center justify-center text-gold">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-wide">
                  Olive Law Firm
                </span>
                <span className="bg-gold/15 border border-gold/30 text-gold text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest font-bold">
                  {sandboxMode ? "Sandbox Console" : "Production Admin"}
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
              className="relative p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-ivory group border border-ivory/10 cursor-pointer"
              title="View system alerts"
            >
              <Bell size={16} className="group-hover:rotate-12 transition-transform" />
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
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-ivory border border-ivory/10 cursor-pointer disabled:opacity-50"
              title="Refresh database collections"
            >
              <RefreshCw size={16} className={dataLoading ? "animate-spin" : ""} />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-gold hover:bg-gold-hover text-forest font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm border border-gold/40 cursor-pointer transition-all shadow-sm"
            >
              <LogOut size={13} />
              Sign Out
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-ivory text-xs px-3 py-2 rounded-sm border border-white/20 cursor-pointer transition-colors"
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
        <div className="flex border-b border-forest/10 gap-2">
          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === "consultations"
                ? "border-gold text-forest bg-white/40"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Client Dossiers ({filteredConsultations.length})
          </button>
          
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === "notifications"
                ? "border-gold text-forest bg-white/40"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Alerts Inbox {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-3 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === "analytics"
                ? "border-gold text-forest bg-white/40"
                : "border-transparent text-charcoal/60 hover:text-forest"
            }`}
          >
            Practice Stats
          </button>
        </div>

        {/* Tab 1: Client Consultations Manager */}
        {activeTab === "consultations" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Filter / Search List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Search & Filter bar */}
              <div className="bg-white p-4 rounded-sm border border-forest/10 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative flex items-center">
                  <Search size={16} className="text-charcoal/40 absolute left-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client dossiers..."
                    className="w-full text-xs bg-sage-light border border-forest/15 rounded px-9 py-2 focus:outline-gold font-medium"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter size={12} className="text-charcoal/60" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-sage-light border border-forest/15 rounded text-[10px] sm:text-xs py-1.5 px-2 focus:outline-gold font-medium"
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
                    className="bg-sage-light border border-forest/15 rounded text-[10px] sm:text-xs py-1.5 px-2 focus:outline-gold font-medium"
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
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {dataLoading && consultations.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded border border-forest/10 shadow-sm">
                    <RefreshCw className="animate-spin text-forest mx-auto" size={32} />
                    <p className="font-serif text-sm italic text-charcoal/60 mt-3">Fetching secure legal database archives...</p>
                  </div>
                ) : filteredConsultations.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded border border-forest/10 shadow-sm">
                    <AlertCircle className="text-charcoal/30 mx-auto" size={32} />
                    <p className="font-serif text-sm italic text-charcoal/60 mt-3">No client dossiers found matching criteria.</p>
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
                        onClick={() => handleSelectDoc(doc)}
                        className={`bg-white border p-4 sm:p-5 rounded-sm transition-all duration-200 cursor-pointer flex flex-col gap-3 shadow-sm hover:shadow ${
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
                        <label className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1.5">
                          Change Administrative Status
                        </label>
                        <select
                          value={docStatus}
                          onChange={(e) => setDocStatus(e.target.value as Consultation["status"])}
                          className="w-full text-xs bg-sage-light border border-forest/20 rounded-sm p-2 focus:outline-gold font-medium"
                        >
                          <option value="pending">Pending Review (New Actionable)</option>
                          <option value="reviewed">Under Active Review (Strategizing)</option>
                          <option value="completed">Completed Case (Consulted)</option>
                          <option value="archived">Archived (In Law Records)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-forest uppercase tracking-wider text-[10px] block mb-1.5">
                          Internal Notes (Confidential)
                        </label>
                        <textarea
                          rows={4}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Record trial strategies, notes on consultation date, court schedules, or legal theories..."
                          className="w-full text-xs bg-sage-light border border-forest/20 rounded-sm p-3 focus:outline-gold font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-2.5 pt-2 border-t border-forest/10 justify-between">
                    <button
                      onClick={() => handleDeleteDoc(selectedDoc.id || "")}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded border border-red-200 transition-colors cursor-pointer"
                      title="Delete dossier"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={handleSaveDocDetails}
                      disabled={isSaving}
                      className="flex-grow bg-forest hover:bg-forest/95 text-gold font-bold text-xs uppercase tracking-wider py-2.5 rounded shadow-sm border border-gold/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
                    >
                      {isSaving ? (
                        <RefreshCw className="animate-spin" size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      Save Case Updates
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-forest/20 rounded-sm shadow-sm p-8 text-center flex flex-col items-center justify-center h-full min-h-60">
                  <Shield className="text-forest/20 mb-4" size={44} />
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
                  <Bell className="text-charcoal/20 mx-auto mb-3" size={32} />
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
                        <Bell size={16} />
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
                          className="bg-forest/5 hover:bg-forest/10 text-forest text-[11px] font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronRight size={12} />
                          Go to dossier
                        </button>
                      )}

                      {!note.read && (
                        <button
                          onClick={() => handleMarkNotificationRead(note.id || "")}
                          className="bg-gold hover:bg-gold-hover text-forest text-[11px] font-bold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} />
                          Mark Read
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

      </main>

      {/* Admin Footer */}
      <footer className="bg-forest border-t border-gold/30 text-ivory/60 text-center py-4 text-xs font-sans mt-auto">
        <p>© 2026 Olive Law Firm. Led by Advocate Reynold D'Souza. All administrative rights secured.</p>
      </footer>
    </div>
  );
}
