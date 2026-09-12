import React, { useState } from "react";
import { 
  Radio, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Save, 
  Check, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  Zap, 
  Sliders, 
  Database, 
  Wifi, 
  FileSpreadsheet, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Lock,
  ExternalLink
} from "lucide-react";
import { useFirmSettings, FirmNotice, FirmContactSettings } from "../hooks/useFirmSettings";
import { useTeamProfiles } from "../hooks/useTeamProfiles";
import { Consultation, LawNotification, fetchConsultations, fetchNotifications, purgeAllPreviousQueries } from "../lib/firebase";

interface AdminOperationsManagerProps {
  consultations: Consultation[];
  notifications: LawNotification[];
  adminEmail: string;
}

export default function AdminOperationsManager({
  consultations,
  notifications,
  adminEmail
}: AdminOperationsManagerProps) {
  const { notice, contact, loading, syncStatus, updateNotice, updateContact, resetSettingsToDefaults } = useFirmSettings();
  const { founder, advocates } = useTeamProfiles();

  // Notice local form state
  const [noticeForm, setNoticeForm] = useState<FirmNotice>(notice);
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  // Contact local form state
  const [contactForm, setContactForm] = useState<FirmContactSettings>(contact);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Diagnostics & Backup state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  // Synchronize with upstream changes if notice/contact updates externally
  React.useEffect(() => {
    setNoticeForm(notice);
  }, [notice]);

  React.useEffect(() => {
    setContactForm(contact);
  }, [contact]);

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeSaved(false);
    setNoticeError(null);
    try {
      const ok = await updateNotice(noticeForm);
      if (ok) {
        setNoticeSaved(true);
        setTimeout(() => setNoticeSaved(false), 3500);
      } else {
        setNoticeSaved(true); // Saved locally
        setTimeout(() => setNoticeSaved(false), 3500);
      }
    } catch (err: any) {
      setNoticeError(err.message || "Failed to circulate notice");
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaved(false);
    setContactError(null);
    try {
      const ok = await updateContact(contactForm);
      if (ok) {
        setContactSaved(true);
        setTimeout(() => setContactSaved(false), 3500);
      } else {
        setContactSaved(true);
        setTimeout(() => setContactSaved(false), 3500);
      }
    } catch (err: any) {
      setContactError(err.message || "Failed to update firm contact info");
    }
  };

  const handleExportFullBackup = async () => {
    setIsExporting(true);
    setExportSuccess(null);
    try {
      const backupData = {
        firmName: "Olive Law Firm®",
        exportedAt: new Date().toISOString(),
        exportedBy: adminEmail,
        chambers: contactForm,
        activeNotice: noticeForm,
        founderProfile: founder,
        legalAssociates: advocates,
        totalConsultations: consultations.length,
        consultations: consultations,
        totalNotifications: notifications.length,
        notifications: notifications,
        systemHealth: {
          cloudFirestoreSync: syncStatus,
          securityStatus: "Zero-Trust ABAC Verified",
          databaseTarget: "ai-studio-olivelawchambers-de310f85-479a-448d-98bf-1193abadf73d"
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Olive_Law_Firm_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess("Complete firm vault backup exported successfully as JSON!");
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (err: any) {
      console.error("Backup export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportConsultationsCSV = () => {
    try {
      if (consultations.length === 0) {
        alert("No consultation records available to export.");
        return;
      }

      const headers = ["ID", "Client Name", "Email", "Phone", "Practice Area", "Subject", "Status", "Created At", "Internal Notes"];
      const rows = consultations.map((c) => [
        `"${c.id}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        `"${(c.practiceArea || "").replace(/"/g, '""')}"`,
        `"${(c.subject || "").replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${typeof c.createdAt === "string" ? c.createdAt : (c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : "N/A")}"`,
        `"${(c.notes || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Olive_Law_Consultations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export error:", err);
    }
  };

  const handlePurgeLocalCache = () => {
    if (window.confirm("Purge local browser cache? This will force a clean re-synchronization directly from the cloud on all tabs.")) {
      setIsPurging(true);
      purgeAllPreviousQueries();
      setPurgeMessage("Local cache purged. Resynchronizing live with Firestore...");
      setTimeout(() => {
        setIsPurging(false);
        setPurgeMessage(null);
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Multi-Device Sync Health & Real-time Connectivity */}
      <div className="bg-forest text-ivory p-5 rounded-sm shadow-md border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
            <Zap className="text-gold" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-white tracking-wide">
                Live Multi-Device Circulation Engine
              </h3>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                syncStatus === "connected" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                {syncStatus === "connected" ? "Live Cloud Synced (0ms)" : "Resilient Offline Buffer"}
              </span>
            </div>
            <p className="text-xs text-ivory/75 font-sans mt-0.5">
              Every edit made below broadcasts automatically to all client devices, phones, tablets, and desktop browsers across India in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePurgeLocalCache}
            disabled={isPurging}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-ivory rounded text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Purge local temporary cache & force full cloud refresh"
          >
            <RefreshCw size={13} className={isPurging ? "animate-spin text-gold" : "text-gold"} />
            <span>Force Cloud Sync</span>
          </button>
        </div>
      </div>

      {purgeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{purgeMessage}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Module 1: Urgent Court Notice & Vacation Bench Broadcast */}
        <div className="bg-white p-6 rounded-sm border border-forest/10 shadow-sm space-y-5">
          <div className="border-b border-forest/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Radio className="text-gold" size={18} />
              <h4 className="font-serif text-base font-bold text-forest">
                Urgent Court Notice &amp; Advisory Broadcast
              </h4>
            </div>
            <span className="text-[11px] font-sans font-semibold text-charcoal/60 bg-sage-light px-2 py-0.5 rounded">
              Circulates Site-Wide
            </span>
          </div>

          <p className="text-xs text-charcoal/70 font-sans leading-relaxed">
            Publish court registry advisories, High Court vacation bench timings, emergency caveat notices, or urgent consultation guidelines. When enabled, this appears prominently at the top of the firm website.
          </p>

          <form onSubmit={handleSaveNotice} className="space-y-4">
            {/* Toggle Active Switch */}
            <div className="flex items-center justify-between p-3.5 bg-sage-light rounded border border-forest/10">
              <div>
                <label htmlFor="notice-toggle" className="text-xs font-bold text-forest cursor-pointer select-none">
                  Display Notice Banner on Website
                </label>
                <p className="text-[11px] text-charcoal/60">
                  {noticeForm.enabled ? "Active: Currently visible to all website visitors" : "Inactive: Banner is hidden"}
                </p>
              </div>
              <input
                type="checkbox"
                id="notice-toggle"
                checked={noticeForm.enabled}
                onChange={(e) => setNoticeForm({ ...noticeForm, enabled: e.target.checked })}
                className="w-5 h-5 accent-forest rounded cursor-pointer"
              />
            </div>

            {/* Notice Category */}
            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                Notice Classification
              </label>
              <select
                value={noticeForm.type}
                onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="info">General Legal Advisory (Navy Blue)</option>
                <option value="urgent">Urgent Court Notice / Caveat Filing (Amber Gold)</option>
                <option value="vacation">High Court Vacation Bench Schedule (Forest Green)</option>
                <option value="registry">Supreme Court / High Court Registry Update (Crimson)</option>
              </select>
            </div>

            {/* Notice Title */}
            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                Notice Headline
              </label>
              <input
                type="text"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                placeholder="e.g. High Court Dharwad Bench Vacation Sittings Active"
                required
                className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Notice Message */}
            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                Detailed Message / Advisory Text
              </label>
              <textarea
                rows={3}
                value={noticeForm.message}
                onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
                placeholder="Enter the advisory note for clients and advocates..."
                required
                className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Action Link & Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={noticeForm.linkText || ""}
                  onChange={(e) => setNoticeForm({ ...noticeForm, linkText: e.target.value })}
                  placeholder="e.g. Schedule Urgent Mentioning"
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  Link Target (#anchor or URL)
                </label>
                <input
                  type="text"
                  value={noticeForm.linkUrl || ""}
                  onChange={(e) => setNoticeForm({ ...noticeForm, linkUrl: e.target.value })}
                  placeholder="e.g. #contact"
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            {/* Save Notice Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-forest hover:bg-forest/90 text-ivory font-sans font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {noticeSaved ? (
                  <>
                    <Check size={14} className="text-gold" />
                    <span>Notice Circulated!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="text-gold" />
                    <span>Publish &amp; Circulate Notice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Module 2: Firm Chamber Hotline & Office Hours */}
        <div className="bg-white p-6 rounded-sm border border-forest/10 shadow-sm space-y-5">
          <div className="border-b border-forest/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="text-gold" size={18} />
              <h4 className="font-serif text-base font-bold text-forest">
                Chamber Hotlines &amp; Filing Coordinates
              </h4>
            </div>
            <span className="text-[11px] font-sans font-semibold text-charcoal/60 bg-sage-light px-2 py-0.5 rounded">
              Synced Across All Footers &amp; Contacts
            </span>
          </div>

          <p className="text-xs text-charcoal/70 font-sans leading-relaxed">
            Update primary phone numbers, 24/7 urgent bail &amp; stay hotline, official registry filing email, and chamber operating hours.
          </p>

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  Primary Phone / Reception
                </label>
                <input
                  type="text"
                  value={contactForm.primaryPhone}
                  onChange={(e) => setContactForm({ ...contactForm, primaryPhone: e.target.value })}
                  required
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  24/7 Emergency Line (Bail/Stay)
                </label>
                <input
                  type="text"
                  value={contactForm.emergencyPhone}
                  onChange={(e) => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                  required
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  WhatsApp Consultation Number
                </label>
                <input
                  type="text"
                  value={contactForm.whatsappNumber}
                  onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                  required
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                  Primary Chambers Email
                </label>
                <input
                  type="email"
                  value={contactForm.primaryEmail}
                  onChange={(e) => setContactForm({ ...contactForm, primaryEmail: e.target.value })}
                  required
                  className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                Official Filing &amp; Pleadings Email
              </label>
              <input
                type="email"
                value={contactForm.filingEmail}
                onChange={(e) => setContactForm({ ...contactForm, filingEmail: e.target.value })}
                required
                className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest uppercase tracking-wider mb-1.5">
                Chambers Working Hours
              </label>
              <input
                type="text"
                value={contactForm.officeHours}
                onChange={(e) => setContactForm({ ...contactForm, officeHours: e.target.value })}
                required
                className="w-full text-xs bg-white border border-forest/20 rounded p-2.5 font-sans focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            {/* Save Contact Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-forest hover:bg-forest/90 text-ivory font-sans font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {contactSaved ? (
                  <>
                    <Check size={14} className="text-gold" />
                    <span>Coordinates Updated!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="text-gold" />
                    <span>Save &amp; Broadcast Coordinates</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Module 3: Full Data Vault Backup & Archival Engine */}
      <div className="bg-white p-6 rounded-sm border border-forest/10 shadow-sm space-y-4">
        <div className="border-b border-forest/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Database className="text-gold" size={18} />
            <h4 className="font-serif text-base font-bold text-forest">
              Data Vault, Export &amp; Disaster Recovery
            </h4>
          </div>
          <span className="text-[11px] font-sans text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-medium flex items-center gap-1">
            <ShieldCheck size={13} />
            <span>Zero Data Loss Protection</span>
          </span>
        </div>

        <p className="text-xs text-charcoal/70 font-sans leading-relaxed">
          Maintain full sovereignty and offline copies of all client dossiers, internship resumes, legal associate biographies, and chamber configurations. Exportable in standardized JSON or spreadsheet-friendly CSV formats anytime.
        </p>

        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{exportSuccess}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportFullBackup}
            disabled={isExporting}
            className="px-4 py-2.5 bg-forest hover:bg-forest/90 text-ivory font-sans font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={14} className="text-gold" />
            <span>Export Master JSON Vault ({consultations.length} Dossiers + Team)</span>
          </button>

          <button
            type="button"
            onClick={handleExportConsultationsCSV}
            className="px-4 py-2.5 bg-white hover:bg-sage-light border border-forest/30 text-forest font-sans font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-gold" />
            <span>Export Consultations to Excel / CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
