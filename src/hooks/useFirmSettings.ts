import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface FirmNotice {
  enabled: boolean;
  title: string;
  message: string;
  type: "info" | "urgent" | "vacation" | "registry";
  linkText?: string;
  linkUrl?: string;
  updatedAt?: any;
}

export interface FirmContactSettings {
  primaryPhone: string;
  emergencyPhone: string;
  whatsappNumber: string;
  primaryEmail: string;
  filingEmail: string;
  officeHours: string;
  bengaluruAddress: string;
  dharwadAddress: string;
  belagaviAddress: string;
  updatedAt?: any;
}

export const DEFAULT_FIRM_NOTICE: FirmNotice = {
  enabled: false,
  title: "High Court & Supreme Court Registry Advisory",
  message: "Urgent mentionings, caveat filings, and bail petitions are processed 24/7 across Bengaluru, Dharwad, and Belagavi chambers.",
  type: "info",
  linkText: "Consultation Request",
  linkUrl: "#contact"
};

export const DEFAULT_FIRM_CONTACT: FirmContactSettings = {
  primaryPhone: "+91 98450 12345",
  emergencyPhone: "+91 94480 67890",
  whatsappNumber: "+91 98450 12345",
  primaryEmail: "advrdsouza181@gmail.com",
  filingEmail: "filings@olivelawfirm.in",
  officeHours: "Monday – Saturday: 9:00 AM – 8:00 PM (Emergency 24/7 for Bail & Injunctions)",
  bengaluruAddress: "2nd Floor, #520, 10th Cross, 12th Main, Padmanabhanagar, Bengaluru 560070",
  dharwadAddress: "#300, Olive Tree Apartment, 1st Cross, Sadankeri, Dharwad 580001",
  belagaviAddress: "Chamber Complex, Opp. Civil Court, Club Road, Belagavi 590001"
};

const LOCAL_NOTICE_KEY = "olive_firm_notice_v1";
const LOCAL_CONTACT_KEY = "olive_firm_contact_v1";
const EVENT_NOTICE_UPDATE = "olive_notice_updated";
const EVENT_CONTACT_UPDATE = "olive_contact_updated";

function getLocalNotice(): FirmNotice {
  try {
    const raw = localStorage.getItem(LOCAL_NOTICE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_FIRM_NOTICE, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Could not read local notice:", e);
  }
  return DEFAULT_FIRM_NOTICE;
}

function saveLocalNotice(notice: FirmNotice) {
  try {
    localStorage.setItem(LOCAL_NOTICE_KEY, JSON.stringify(notice));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT_NOTICE_UPDATE));
    }
  } catch (e) {
    console.error("Local storage error saving notice:", e);
  }
}

function getLocalContact(): FirmContactSettings {
  try {
    const raw = localStorage.getItem(LOCAL_CONTACT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_FIRM_CONTACT, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Could not read local contact settings:", e);
  }
  return DEFAULT_FIRM_CONTACT;
}

function saveLocalContact(contact: FirmContactSettings) {
  try {
    localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify(contact));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT_CONTACT_UPDATE));
    }
  } catch (e) {
    console.error("Local storage error saving contact settings:", e);
  }
}

export function useFirmSettings() {
  const [notice, setNotice] = useState<FirmNotice>(() => getLocalNotice());
  const [contact, setContact] = useState<FirmContactSettings>(() => getLocalContact());
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "offline">("connected");

  useEffect(() => {
    // 1. Listen for local storage/custom events across tabs
    const handleLocalNoticeUpdate = () => setNotice(getLocalNotice());
    const handleLocalContactUpdate = () => setContact(getLocalContact());

    window.addEventListener(EVENT_NOTICE_UPDATE, handleLocalNoticeUpdate);
    window.addEventListener(EVENT_CONTACT_UPDATE, handleLocalContactUpdate);
    window.addEventListener("storage", handleLocalNoticeUpdate);
    window.addEventListener("storage", handleLocalContactUpdate);

    // 2. Real-time Firestore Cloud listener for Notice
    const noticeDocRef = doc(db, "firm_settings", "notice");
    const unsubscribeNotice = onSnapshot(noticeDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FirmNotice;
        const liveNotice = { ...DEFAULT_FIRM_NOTICE, ...data };
        setNotice(liveNotice);
        saveLocalNotice(liveNotice);
      }
      setSyncStatus("connected");
    }, (err) => {
      console.warn("Firestore notice listener offline fallback:", err);
      setSyncStatus("offline");
    });

    // 3. Real-time Firestore Cloud listener for Contact & Chambers
    const contactDocRef = doc(db, "firm_settings", "chambers");
    const unsubscribeContact = onSnapshot(contactDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FirmContactSettings;
        const liveContact = { ...DEFAULT_FIRM_CONTACT, ...data };
        setContact(liveContact);
        saveLocalContact(liveContact);
      }
      setSyncStatus("connected");
    }, (err) => {
      console.warn("Firestore contact listener offline fallback:", err);
      setSyncStatus("offline");
    });

    return () => {
      window.removeEventListener(EVENT_NOTICE_UPDATE, handleLocalNoticeUpdate);
      window.removeEventListener(EVENT_CONTACT_UPDATE, handleLocalContactUpdate);
      window.removeEventListener("storage", handleLocalNoticeUpdate);
      window.removeEventListener("storage", handleLocalContactUpdate);
      unsubscribeNotice();
      unsubscribeContact();
    };
  }, []);

  const updateNotice = useCallback(async (newNotice: FirmNotice): Promise<boolean> => {
    setLoading(true);
    setSyncStatus("syncing");
    setNotice(newNotice);
    saveLocalNotice(newNotice);

    try {
      const docRef = doc(db, "firm_settings", "notice");
      await setDoc(docRef, {
        ...newNotice,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Failed to write notice to cloud, saved locally:", err);
      setSyncStatus("offline");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContact = useCallback(async (newContact: FirmContactSettings): Promise<boolean> => {
    setLoading(true);
    setSyncStatus("syncing");
    setContact(newContact);
    saveLocalContact(newContact);

    try {
      const docRef = doc(db, "firm_settings", "chambers");
      await setDoc(docRef, {
        ...newContact,
        updatedAt: Timestamp.now()
      });
      setSyncStatus("connected");
      return true;
    } catch (err) {
      console.warn("Failed to write contact settings to cloud, saved locally:", err);
      setSyncStatus("offline");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSettingsToDefaults = useCallback(async (): Promise<void> => {
    setLoading(true);
    setNotice(DEFAULT_FIRM_NOTICE);
    setContact(DEFAULT_FIRM_CONTACT);
    saveLocalNotice(DEFAULT_FIRM_NOTICE);
    saveLocalContact(DEFAULT_FIRM_CONTACT);

    try {
      await Promise.all([
        setDoc(doc(db, "firm_settings", "notice"), { ...DEFAULT_FIRM_NOTICE, updatedAt: Timestamp.now() }),
        setDoc(doc(db, "firm_settings", "chambers"), { ...DEFAULT_FIRM_CONTACT, updatedAt: Timestamp.now() })
      ]);
    } catch (err) {
      console.warn("Reset to defaults cloud sync error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notice,
    contact,
    loading,
    syncStatus,
    updateNotice,
    updateContact,
    resetSettingsToDefaults
  };
}
