'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Profile,
  Family,
  Citizen,
  Note,
  NoteStatus,
  VillageStats,
} from './types';
import {
  DEMO_PROFILES,
  INITIAL_FAMILIES,
  INITIAL_CITIZENS,
  INITIAL_NOTES,
  filterFamiliesByRole,
  filterCitizensByRole,
  filterNotesByRole,
  computeStatsForProfile,
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

interface AppContextType {
  currentProfile: Profile | null;
  allProfiles: Profile[];
  switchProfile: (profileId: string) => void;
  logout: () => void;
  families: Family[];
  citizens: Citizen[];
  notes: Note[];
  visibleFamilies: Family[];
  visibleCitizens: Citizen[];
  visibleNotes: Note[];
  stats: VillageStats;
  isOnline: boolean;
  isLoading: boolean;
  // CRUD actions
  addNote: (note: {
    family_id?: string | null;
    citizen_id?: string | null;
    message: string;
    family_no_kk?: string;
    citizen_name?: string;
    citizen_nik?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateNoteStatus: (noteId: string, status: NoteStatus) => Promise<void>;
  addFamily: (family: Omit<Family, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Family; error?: string }>;
  updateFamily: (id: string, partial: Partial<Family>) => Promise<{ success: boolean; error?: string }>;
  deleteFamily: (id: string) => Promise<{ success: boolean; error?: string }>;
  addCitizen: (citizen: Omit<Citizen, 'id' | 'created_at'>) => Promise<{ success: boolean; data?: Citizen; error?: string }>;
  updateCitizen: (id: string, partial: Partial<Citizen>) => Promise<{ success: boolean; error?: string }>;
  deleteCitizen: (id: string) => Promise<{ success: boolean; error?: string }>;
  importBulkData: (incomingFamilies: Family[], incomingCitizens: Citizen[]) => Promise<{ success: boolean; familiesCount: number; citizensCount: number; error?: string }>;
  syncToSupabase: () => Promise<{ success: boolean; message: string }>;
  fetchFromSupabase: () => Promise<{ success: boolean; message: string; count: number }>;
  isSupabaseConnected: boolean;
  getFamilyById: (id: string) => Family | undefined;
  getCitizensByFamilyId: (familyId: string) => Citizen[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'karanghaur_profile_id',
  FAMILIES: 'karanghaur_families_v2',
  CITIZENS: 'karanghaur_citizens_v2',
  NOTES: 'karanghaur_notes_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(DEMO_PROFILES[0]); // default to Admin for easy initial review
  const [families, setFamilies] = useState<Family[]>(INITIAL_FAMILIES);
  const [citizens, setCitizens] = useState<Citizen[]>(INITIAL_CITIZENS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Online/offline listeners
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load stored profile
    const savedProfileId = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (savedProfileId) {
      const found = DEMO_PROFILES.find((p) => p.id === savedProfileId);
      if (found) setCurrentProfile(found);
    }

    // Load stored families
    const savedFamilies = localStorage.getItem(STORAGE_KEYS.FAMILIES);
    if (savedFamilies) {
      try {
        setFamilies(JSON.parse(savedFamilies));
      } catch (e) {
        console.error('Error parsing saved families', e);
      }
    }

    // Load stored citizens
    const savedCitizens = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    if (savedCitizens) {
      try {
        setCitizens(JSON.parse(savedCitizens));
      } catch (e) {
        console.error('Error parsing saved citizens', e);
      }
    }

    // Load stored notes
    const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error parsing saved notes', e);
      }
    }

    setIsLoading(false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
      localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [families, citizens, notes, isLoading]);

  // Handle Profile Switch
  const switchProfile = (profileId: string) => {
    const target = DEMO_PROFILES.find((p) => p.id === profileId);
    if (target) {
      setCurrentProfile(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PROFILE, target.id);
      }
    }
  };

  const logout = () => {
    setCurrentProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    }
  };

  // RBAC Filtered Data
  const visibleFamilies = useMemo(() => {
    return filterFamiliesByRole(families, currentProfile);
  }, [families, currentProfile]);

  const visibleCitizens = useMemo(() => {
    return filterCitizensByRole(citizens, families, currentProfile);
  }, [citizens, families, currentProfile]);

  const visibleNotes = useMemo(() => {
    return filterNotesByRole(notes, currentProfile);
  }, [notes, currentProfile]);

  const stats = useMemo(() => {
    return computeStatsForProfile(families, citizens, notes, currentProfile);
  }, [families, citizens, notes, currentProfile]);

  // Actions
  const addNote = async (newNoteData: {
    family_id?: string | null;
    citizen_id?: string | null;
    message: string;
    family_no_kk?: string;
    citizen_name?: string;
    citizen_nik?: string;
  }) => {
    if (!currentProfile) {
      return { success: false, error: 'Silakan login terlebih dahulu' };
    }

    // Determine target location for the note
    let dusun = currentProfile.assigned_dusun || 'Dusun I';
    let rw = currentProfile.assigned_rw || '001';
    let rt = currentProfile.assigned_rt || '001';

    if (newNoteData.family_id) {
      const fam = families.find((f) => f.id === newNoteData.family_id);
      if (fam) {
        dusun = fam.dusun;
        rw = fam.rw;
        rt = fam.rt;
      }
    }

    const newNote: Note = {
      id: 'note-' + Date.now(),
      family_id: newNoteData.family_id || null,
      citizen_id: newNoteData.citizen_id || null,
      author_id: currentProfile.id,
      message: newNoteData.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      family_no_kk: newNoteData.family_no_kk,
      citizen_name: newNoteData.citizen_name,
      citizen_nik: newNoteData.citizen_nik,
      dusun,
      rw,
      rt,
    };

    setNotes((prev) => [newNote, ...prev]);

    // If Supabase is connected, sync to backend
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notes').insert({
          family_id: newNote.family_id,
          citizen_id: newNote.citizen_id,
          author_id: newNote.author_id,
          message: newNote.message,
          status: newNote.status,
        });
      } catch (err) {
        console.warn('Supabase sync note error:', err);
      }
    }

    return { success: true };
  };

  const updateNoteStatus = async (noteId: string, status: NoteStatus) => {
    if (currentProfile?.role !== 'admin') {
      alert('Hanya Admin Desa yang dapat mengubah status tindak lanjut catatan!');
      return;
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, status } : n))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notes').update({ status }).eq('id', noteId);
      } catch (err) {
        console.warn('Supabase update note status error:', err);
      }
    }
  };

  const addFamily = async (famData: Omit<Family, 'id' | 'created_at'>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang memiliki hak membuat Kartu Keluarga baru.' };
    }

    const newFam: Family = {
      ...famData,
      id: 'fam-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    setFamilies((prev) => [newFam, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('families').insert(newFam);
      } catch (err) {
        console.warn('Supabase insert family error:', err);
      }
    }

    return { success: true, data: newFam };
  };

  const updateFamily = async (id: string, partial: Partial<Family>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat mengubah data Kartu Keluarga.' };
    }

    setFamilies((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...partial } : f))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('families').update(partial).eq('id', id);
      } catch (err) {
        console.warn('Supabase update family error:', err);
      }
    }

    return { success: true };
  };

  const deleteFamily = async (id: string) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat menghapus data Kartu Keluarga.' };
    }

    setFamilies((prev) => prev.filter((f) => f.id !== id));
    setCitizens((prev) => prev.filter((c) => c.family_id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('families').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete family error:', err);
      }
    }

    return { success: true };
  };

  const addCitizen = async (citData: Omit<Citizen, 'id' | 'created_at'>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang memiliki hak menambah warga baru.' };
    }

    const newCit: Citizen = {
      ...citData,
      id: 'cit-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    setCitizens((prev) => [newCit, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('citizens').insert(newCit);
      } catch (err) {
        console.warn('Supabase insert citizen error:', err);
      }
    }

    return { success: true, data: newCit };
  };

  const updateCitizen = async (id: string, partial: Partial<Citizen>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat mengubah data warga.' };
    }

    setCitizens((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial } : c))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('citizens').update(partial).eq('id', id);
      } catch (err) {
        console.warn('Supabase update citizen error:', err);
      }
    }

    return { success: true };
  };

  const deleteCitizen = async (id: string) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat menghapus data warga.' };
    }

    setCitizens((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('citizens').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete citizen error:', err);
      }
    }

    return { success: true };
  };

  const importBulkData = async (incomingFamilies: Family[], incomingCitizens: Citizen[]) => {
    if (currentProfile?.role !== 'admin') {
      return {
        success: false,
        familiesCount: 0,
        citizensCount: 0,
        error: 'Hanya Admin Desa yang memiliki hak mengimpor database.',
      };
    }

    // Merge families by no_kk
    setFamilies((prev) => {
      const existingMap = new Map(prev.map((f) => [f.no_kk, f]));
      incomingFamilies.forEach((f) => {
        const existing = existingMap.get(f.no_kk);
        if (existing) {
          existingMap.set(f.no_kk, { ...existing, ...f, id: existing.id });
        } else {
          existingMap.set(f.no_kk, f);
        }
      });
      return Array.from(existingMap.values());
    });

    // Merge citizens by nik
    setCitizens((prev) => {
      const existingMap = new Map(prev.map((c) => [c.nik, c]));
      incomingCitizens.forEach((c) => {
        const existing = existingMap.get(c.nik);
        if (existing) {
          existingMap.set(c.nik, { ...existing, ...c, id: existing.id });
        } else {
          existingMap.set(c.nik, c);
        }
      });
      return Array.from(existingMap.values());
    });

    // If Supabase is connected, upsert
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('families').upsert(incomingFamilies, { onConflict: 'no_kk' });
        await supabase.from('citizens').upsert(incomingCitizens, { onConflict: 'nik' });
      } catch (err) {
        console.warn('Supabase bulk upsert error:', err);
      }
    }

    return {
      success: true,
      familiesCount: incomingFamilies.length,
      citizensCount: incomingCitizens.length,
    };
  };

  const syncToSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase URL & Anon Key belum terkonfigurasi di .env.local.' };
    }

    try {
      // Upsert families
      const { error: famErr } = await supabase.from('families').upsert(families, { onConflict: 'no_kk' });
      if (famErr) throw famErr;

      // Upsert citizens
      const { error: citErr } = await supabase.from('citizens').upsert(citizens, { onConflict: 'nik' });
      if (citErr) throw citErr;

      // Upsert notes
      if (notes.length > 0) {
        const { error: noteErr } = await supabase.from('notes').upsert(notes, { onConflict: 'id' });
        if (noteErr) throw noteErr;
      }

      return {
        success: true,
        message: `Berhasil menyinkronkan ${families.length} KK dan ${citizens.length} Warga ke Supabase Cloud!`,
      };
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      return {
        success: false,
        message: err.message || 'Gagal menyinkronkan ke Supabase. Pastikan tabel di Supabase SQL Editor sudah dibuat.',
      };
    }
  };

  const fetchFromSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase URL & Anon Key belum terkonfigurasi di .env.local.', count: 0 };
    }

    try {
      const { data: famData, error: famErr } = await supabase.from('families').select('*').order('created_at', { ascending: false });
      if (famErr) throw famErr;

      const { data: citData, error: citErr } = await supabase.from('citizens').select('*');
      if (citErr) throw citErr;

      const { data: noteData, error: noteErr } = await supabase.from('notes').select('*');
      if (noteErr) throw noteErr;

      let count = 0;
      if (famData && famData.length > 0) {
        setFamilies(famData);
        localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(famData));
        count += famData.length;
      }
      if (citData && citData.length > 0) {
        setCitizens(citData);
        localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citData));
        count += citData.length;
      }
      if (noteData && noteData.length > 0) {
        setNotes(noteData);
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(noteData));
      }

      return {
        success: true,
        message: `Berhasil mengunduh ${famData?.length || 0} KK dan ${citData?.length || 0} Warga dari Supabase Cloud.`,
        count,
      };
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      return {
        success: false,
        message: err.message || 'Gagal memuat data dari Supabase. Pastikan tabel sudah dibuat via SQL Editor.',
        count: 0,
      };
    }
  };

  const getFamilyById = (id: string) => {
    return families.find((f) => f.id === id);
  };

  const getCitizensByFamilyId = (familyId: string) => {
    return citizens.filter((c) => c.family_id === familyId);
  };

  return (
    <AppContext.Provider
      value={{
        currentProfile,
        allProfiles: DEMO_PROFILES,
        switchProfile,
        logout,
        families,
        citizens,
        notes,
        visibleFamilies,
        visibleCitizens,
        visibleNotes,
        stats,
        isOnline,
        isLoading,
        addNote,
        updateNoteStatus,
        addFamily,
        updateFamily,
        deleteFamily,
        addCitizen,
        updateCitizen,
        deleteCitizen,
        importBulkData,
        syncToSupabase,
        fetchFromSupabase,
        isSupabaseConnected: isSupabaseConfigured,
        getFamilyById,
        getCitizensByFamilyId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
