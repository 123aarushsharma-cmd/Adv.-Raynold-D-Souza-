import { useState, useEffect, useCallback } from "react";
import { doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  db,
  FounderProfile,
  AdvocateProfile,
  DEFAULT_FOUNDER_PROFILE,
  DEFAULT_ADVOCATES,
  fetchFounderProfile,
  fetchAdvocates,
  saveFounderProfile,
  saveAdvocate,
  createAdvocate,
  deleteAdvocate,
  reorderAdvocates,
  resetTeamToDefaults,
  getLocalFounderProfile,
  getLocalAdvocates,
  saveLocalFounderProfile,
  saveLocalAdvocates
} from "../lib/firebase";

export function useTeamProfiles() {
  const [founder, setFounder] = useState<FounderProfile>(() => getLocalFounderProfile());
  const [advocates, setAdvocates] = useState<AdvocateProfile[]>(() => getLocalAdvocates());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [f, a] = await Promise.all([
        fetchFounderProfile(),
        fetchAdvocates()
      ]);
      setFounder(f);
      setAdvocates(a);
    } catch (err) {
      console.warn("Error loading team profiles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // 1. Listen to real-time custom events across local windows/tabs
    const handleUpdate = () => {
      setFounder(getLocalFounderProfile());
      setAdvocates(getLocalAdvocates());
    };
    window.addEventListener("olive_team_updated", handleUpdate);

    // 2. Real-time Firestore Cloud listener for Founder Profile
    const founderDocRef = doc(db, "founder_profile", "main");
    const unsubscribeFounder = onSnapshot(founderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const raw = docSnap.data();
        const cleanPhoto = (raw.photoUrl && !raw.photoUrl.includes("unsplash.com")) ? raw.photoUrl : "";
        const liveFounder: FounderProfile = {
          ...DEFAULT_FOUNDER_PROFILE,
          ...raw,
          photoUrl: cleanPhoto
        };
        setFounder(liveFounder);
        saveLocalFounderProfile(liveFounder);
      }
    }, (err) => {
      console.warn("Firestore live founder listener disconnected:", err);
    });

    // 3. Real-time Firestore Cloud listener for Advocates
    const advocatesQuery = query(collection(db, "advocates"), orderBy("displayOrder", "asc"));
    const unsubscribeAdvocates = onSnapshot(advocatesQuery, (querySnap) => {
      if (!querySnap.empty) {
        const liveAdvocates: AdvocateProfile[] = [];
        querySnap.forEach((d) => {
          const raw = d.data();
          const cleanPhoto = (raw.photoUrl && !raw.photoUrl.includes("unsplash.com")) ? raw.photoUrl : "";
          liveAdvocates.push({
            id: d.id,
            ...raw,
            photoUrl: cleanPhoto
          } as AdvocateProfile);
        });
        setAdvocates(liveAdvocates);
        saveLocalAdvocates(liveAdvocates);
      }
    }, (err) => {
      console.warn("Firestore live advocates listener disconnected:", err);
    });

    return () => {
      window.removeEventListener("olive_team_updated", handleUpdate);
      unsubscribeFounder();
      unsubscribeAdvocates();
    };
  }, [loadData]);

  const updateFounder = async (updated: FounderProfile) => {
    setFounder(updated);
    await saveFounderProfile(updated);
  };

  const updateAdvocateItem = async (advocate: AdvocateProfile) => {
    setAdvocates(prev => prev.map(a => a.id === advocate.id ? advocate : a));
    await saveAdvocate(advocate);
  };

  const addNewAdvocate = async (advocate: Omit<AdvocateProfile, "id">) => {
    const created = await createAdvocate(advocate);
    setAdvocates(prev => [...prev, created]);
    return created;
  };

  const removeAdvocate = async (id: string) => {
    setAdvocates(prev => prev.filter(a => a.id !== id));
    await deleteAdvocate(id);
  };

  const reorderList = async (newList: AdvocateProfile[]) => {
    setAdvocates(newList);
    await reorderAdvocates(newList);
  };

  const resetAll = async () => {
    const res = await resetTeamToDefaults();
    setFounder(res.founder);
    setAdvocates(res.advocates);
  };

  return {
    founder,
    advocates,
    loading,
    refresh: loadData,
    updateFounder,
    updateAdvocateItem,
    addNewAdvocate,
    removeAdvocate,
    reorderList,
    resetAll
  };
}
