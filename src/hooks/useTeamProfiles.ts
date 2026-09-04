import { useState, useEffect, useCallback } from "react";
import {
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
  getLocalAdvocates
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

    // Listen to real-time custom events when team profiles change
    const handleUpdate = () => {
      setFounder(getLocalFounderProfile());
      setAdvocates(getLocalAdvocates());
    };

    window.addEventListener("olive_team_updated", handleUpdate);
    return () => window.removeEventListener("olive_team_updated", handleUpdate);
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
