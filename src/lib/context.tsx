'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
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

// =========================================================================
// DATA SANITIZERS (Ensures strictly valid columns for Supabase PostgreSQL)
// =========================================================================
export const sanitizeProfile = (p: Partial<Profile>): any => {
  const allowed = [
    'id', 'full_name', 'role', 'assigned_dusun',
    'assigned_rw', 'assigned_rt', 'phone', 'avatar_url', 'created_at'
  ];
  const clean: any = {};
  for (const key of allowed) {
    if ((p as any)[key] !== undefined) {
      clean[key] = (p as any)[key];
    }
  }
  return clean;
};

export const sanitizeFamily = (f: Partial<Family>): any => {
  const allowed = [
    'id', 'no_kk', 'kepala_keluarga', 'alamat', 'no_rumah',
    'dusun', 'rw', 'rt', 'status_barcode', 'status_update',
    'penerangan', 'fasilitas_mck', 'bantuan_sosial', 'created_at'
  ];
  const clean: any = {};
  for (const key of allowed) {
    if ((f as any)[key] !== undefined) {
      clean[key] = (f as any)[key];
    }
  }
  return clean;
};

export const sanitizeCitizen = (c: Partial<Citizen>): any => {
  const allowed = [
    'id', 'family_id', 'nik', 'nama_lengkap', 'hubungan_keluarga',
    'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama',
    'pendidikan_terakhir', 'pekerjaan', 'status_perkawinan',
    'bpjs_kesehatan', 'disabilitas', 'status_tki', 'akta_kelahiran',
    'akta_nikah', 'created_at'
  ];
  const clean: any = {};
  for (const key of allowed) {
    if ((c as any)[key] !== undefined) {
      clean[key] = (c as any)[key];
    }
  }
  return clean;
};

export const sanitizeNote = (n: Partial<Note>): any => {
  const allowed = [
    'id', 'family_id', 'citizen_id', 'author_id', 'family_no_kk',
    'citizen_name', 'citizen_nik', 'dusun', 'rw', 'rt',
    'message', 'status', 'created_at'
  ];
  const clean: any = {};
  for (const key of allowed) {
    if ((n as any)[key] !== undefined) {
      clean[key] = (n as any)[key];
    }
  }
  return clean;
};

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
  isSyncingWithSupabase: boolean;
  lastSyncedAt: string | null;
  refreshFromSupabase: () => Promise<void>;
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
  deleteNote: (noteId: string) => Promise<{ success: boolean; error?: string }>;
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
  PROFILE: 'karanghaur_profile_id_v3',
  PROFILES_LIST: 'karanghaur_profiles_v3',
  FAMILIES: 'karanghaur_families_v3',
  CITIZENS: 'karanghaur_citizens_v3',
  NOTES: 'karanghaur_notes_v3',
  LAST_SYNC: 'karanghaur_last_sync_time',
};

const LEGACY_PROFILE_MAP: Record<string, string> = {
  'user-admin-01': 'prof-admin',
  'user-kadus-01': 'prof-kadus-1',
  'user-rw-01': 'prof-rw-01',
  'user-rt-01': 'prof-rt-01',
  'user-rt-02': 'prof-rt-02',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allProfiles, setAllProfiles] = useState<Profile[]>(DEMO_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(DEMO_PROFILES[0]);
  const [families, setFamilies] = useState<Family[]>(INITIAL_FAMILIES);
  const [citizens, setCitizens] = useState<Citizen[]>(INITIAL_CITIZENS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Re-usable live fetch from Supabase (with automatic initial seeding if Supabase tables are empty)
  const refreshFromSupabase = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      setIsSyncingWithSupabase(true);
      const [profRes, famRes, citRes, noteRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('families').select('*').order('created_at', { ascending: false }),
        supabase.from('citizens').select('*').order('created_at', { ascending: false }),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
      ]);

      // Auto-seed profiles if table exists and is empty
      if (!profRes.error && profRes.data) {
        if (profRes.data.length > 0) {
          setAllProfiles(profRes.data);
          localStorage.setItem(STORAGE_KEYS.PROFILES_LIST, JSON.stringify(profRes.data));
        } else {
          await supabase.from('profiles').upsert(DEMO_PROFILES.map(sanitizeProfile), { onConflict: 'id' });
        }
      }

      // Auto-seed families & citizens if table exists and is completely empty
      if (!famRes.error && famRes.data) {
        if (famRes.data.length > 0) {
          setFamilies(famRes.data);
          localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(famRes.data));
        } else {
          await supabase.from('families').upsert(INITIAL_FAMILIES.map(sanitizeFamily), { onConflict: 'no_kk' });
        }
      }

      if (!citRes.error && citRes.data) {
        if (citRes.data.length > 0) {
          setCitizens(citRes.data);
          localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citRes.data));
        } else if (!famRes.error && famRes.data && famRes.data.length === 0) {
          await supabase.from('citizens').upsert(INITIAL_CITIZENS.map(sanitizeCitizen), { onConflict: 'nik' });
        }
      }

      if (!noteRes.error && noteRes.data) {
        if (noteRes.data.length > 0 || (famRes.data && famRes.data.length > 0)) {
          setNotes(noteRes.data);
          localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(noteRes.data));
        } else if (!famRes.error && famRes.data && famRes.data.length === 0) {
          await supabase.from('notes').upsert(INITIAL_NOTES.map(sanitizeNote), { onConflict: 'id' });
        }
      }

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedAt(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
    } catch (err) {
      console.warn('Realtime Supabase fetch error:', err);
    } finally {
      setIsSyncingWithSupabase(false);
    }
  }, []);

  // Initialize from LocalStorage and then auto-sync from Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      refreshFromSupabase();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 1. Load stored profiles list
    let loadedProfiles = DEMO_PROFILES;
    const savedProfilesList = localStorage.getItem(STORAGE_KEYS.PROFILES_LIST);
    if (savedProfilesList) {
      try {
        const parsed = JSON.parse(savedProfilesList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedProfiles = parsed;
          setAllProfiles(parsed);
        }
      } catch (e) {
        console.error('Error parsing saved profiles', e);
      }
    }

    // 2. Load stored active profile
    const rawSavedProfileId =
      localStorage.getItem(STORAGE_KEYS.PROFILE) ||
      localStorage.getItem('karanghaur_profile_id');
    if (rawSavedProfileId) {
      const mappedId = LEGACY_PROFILE_MAP[rawSavedProfileId] || rawSavedProfileId;
      const found = loadedProfiles.find((p) => p.id === mappedId);
      if (found) setCurrentProfile(found);
    }

    // 3. Load stored families from cache
    const savedFamilies = localStorage.getItem(STORAGE_KEYS.FAMILIES);
    if (savedFamilies) {
      try {
        setFamilies(JSON.parse(savedFamilies));
      } catch (e) {
        console.error('Error parsing saved families', e);
      }
    }

    // 4. Load stored citizens from cache
    const savedCitizens = localStorage.getItem(STORAGE_KEYS.CITIZENS);
    if (savedCitizens) {
      try {
        setCitizens(JSON.parse(savedCitizens));
      } catch (e) {
        console.error('Error parsing saved citizens', e);
      }
    }

    // 5. Load stored notes from cache
    const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error parsing saved notes', e);
      }
    }

    // 6. Load last sync time
    const savedSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (savedSync) setLastSyncedAt(savedSync);

    setIsLoading(false);

    // 7. Automatically fetch live data from Supabase Cloud on start
    if (navigator.onLine && isSupabaseConfigured && supabase) {
      refreshFromSupabase();
    }

    // 8. Establish Supabase Realtime Subscription
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('karanghaur-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setFamilies((prev) => [payload.new as Family, ...prev.filter((f) => f.id !== payload.new.id && f.no_kk !== (payload.new as Family).no_kk)]);
          } else if (payload.eventType === 'UPDATE') {
            setFamilies((prev) => prev.map((f) => (f.id === payload.new.id ? { ...f, ...(payload.new as Family) } : f)));
          } else if (payload.eventType === 'DELETE') {
            setFamilies((prev) => prev.filter((f) => f.id !== payload.old.id));
          }
          setLastSyncedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setCitizens((prev) => [payload.new as Citizen, ...prev.filter((c) => c.id !== payload.new.id && c.nik !== (payload.new as Citizen).nik)]);
          } else if (payload.eventType === 'UPDATE') {
            setCitizens((prev) => prev.map((c) => (c.id === payload.new.id ? { ...c, ...(payload.new as Citizen) } : c)));
          } else if (payload.eventType === 'DELETE') {
            setCitizens((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
          setLastSyncedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes((prev) => [payload.new as Note, ...prev.filter((n) => n.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setNotes((prev) => prev.map((n) => (n.id === payload.new.id ? { ...n, ...(payload.new as Note) } : n)));
          } else if (payload.eventType === 'DELETE') {
            setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
          setLastSyncedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshFromSupabase]);

  // Save changes to localStorage for offline cache
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
      localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [families, citizens, notes, isLoading]);

  // Keep currentProfile synced if allProfiles updates
  useEffect(() => {
    if (currentProfile) {
      const updated = allProfiles.find((p) => p.id === currentProfile.id);
      if (updated && updated !== currentProfile) {
        setCurrentProfile(updated);
      }
    }
  }, [allProfiles, currentProfile]);

  // Handle Profile Switch
  const switchProfile = (profileId: string) => {
    const mappedId = LEGACY_PROFILE_MAP[profileId] || profileId;
    const target = allProfiles.find((p) => p.id === mappedId);
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

    // Live Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const clean = sanitizeNote(newNote);
        const { error } = await supabase.from('notes').insert(clean);
        if (error) {
          console.warn('Supabase insert note error:', error);
        } else {
          setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
        }
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
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err) {
        console.warn('Supabase update note status error:', err);
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat menghapus catatan.' };
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (error) {
          return { success: false, error: error.message };
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const addFamily = async (famData: Omit<Family, 'id' | 'created_at'>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang memiliki hak membuat Kartu Keluarga baru.' };
    }

    if (families.some((f) => f.no_kk === famData.no_kk)) {
      return { success: false, error: `Nomor KK ${famData.no_kk} sudah terdaftar di database.` };
    }

    const newFam: Family = {
      ...famData,
      id: 'fam-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    setFamilies((prev) => [newFam, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const clean = sanitizeFamily(newFam);
        const { error } = await supabase.from('families').upsert(clean, { onConflict: 'no_kk' });
        if (error) {
          console.error('Supabase insert family error:', error);
          return { success: false, error: error.message };
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase insert family exception:', err);
        return { success: false, error: err.message };
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
        const clean = sanitizeFamily(partial);
        const { error } = await supabase.from('families').update(clean).eq('id', id);
        if (error) {
          console.error('Supabase update family error:', error);
          return { success: false, error: error.message };
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase update family exception:', err);
        return { success: false, error: err.message };
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
        await supabase.from('citizens').delete().eq('family_id', id);
        const { error } = await supabase.from('families').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete family error:', error);
          return { success: false, error: error.message };
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase delete family error:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  };

  const addCitizen = async (citData: Omit<Citizen, 'id' | 'created_at'>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang memiliki hak menambah warga baru.' };
    }

    if (citizens.some((c) => c.nik === citData.nik)) {
      return { success: false, error: `NIK ${citData.nik} sudah terdaftar di database.` };
    }

    const newCit: Citizen = {
      ...citData,
      id: 'cit-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    setCitizens((prev) => [newCit, ...prev]);

    // Auto-sync Kepala Keluarga name on parent Family if hubungan_keluarga is Kepala Keluarga
    if (citData.hubungan_keluarga === 'Kepala Keluarga' && citData.family_id) {
      setFamilies((prev) =>
        prev.map((f) =>
          f.id === citData.family_id
            ? { ...f, kepala_keluarga: citData.nama_lengkap.toUpperCase() }
            : f
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const clean = sanitizeCitizen(newCit);
        const { error } = await supabase.from('citizens').upsert(clean, { onConflict: 'nik' });
        if (error) {
          console.error('Supabase insert citizen error:', error);
          return { success: false, error: error.message };
        }
        if (citData.hubungan_keluarga === 'Kepala Keluarga' && citData.family_id) {
          await supabase
            .from('families')
            .update({ kepala_keluarga: citData.nama_lengkap.toUpperCase() })
            .eq('id', citData.family_id);
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase insert citizen exception:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true, data: newCit };
  };

  const updateCitizen = async (id: string, partial: Partial<Citizen>) => {
    if (currentProfile?.role !== 'admin') {
      return { success: false, error: 'Hanya Admin Desa yang dapat mengubah data warga.' };
    }

    const existingCit = citizens.find((c) => c.id === id);
    setCitizens((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial } : c))
    );

    const targetFamilyId = partial.family_id || existingCit?.family_id;
    const targetHubungan = partial.hubungan_keluarga || existingCit?.hubungan_keluarga;
    const targetNama = partial.nama_lengkap || existingCit?.nama_lengkap;

    if (targetHubungan === 'Kepala Keluarga' && targetFamilyId && targetNama) {
      setFamilies((prev) =>
        prev.map((f) =>
          f.id === targetFamilyId ? { ...f, kepala_keluarga: targetNama.toUpperCase() } : f
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const clean = sanitizeCitizen(partial);
        const { error } = await supabase.from('citizens').update(clean).eq('id', id);
        if (error) {
          console.error('Supabase update citizen error:', error);
          return { success: false, error: error.message };
        }
        if (targetHubungan === 'Kepala Keluarga' && targetFamilyId && targetNama) {
          await supabase
            .from('families')
            .update({ kepala_keluarga: targetNama.toUpperCase() })
            .eq('id', targetFamilyId);
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase update citizen exception:', err);
        return { success: false, error: err.message };
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
        const { error } = await supabase.from('citizens').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete citizen error:', error);
          return { success: false, error: error.message };
        }
        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.error('Supabase delete citizen error:', err);
        return { success: false, error: err.message };
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

    // 1. Resolve family IDs so existing no_kk keeps its canonical ID and remaps incoming family_id
    const existingFamByNoKk = new Map(families.map((f) => [f.no_kk, f]));
    const familyIdRemap = new Map<string, string>();

    const resolvedIncomingFamilies: Family[] = incomingFamilies.map((f) => {
      const existing = existingFamByNoKk.get(f.no_kk);
      const canonicalId = existing ? existing.id : f.id;
      familyIdRemap.set(f.id, canonicalId);
      return {
        ...(existing || {}),
        ...f,
        id: canonicalId,
      };
    });

    // 2. Resolve citizen IDs by NIK and remap their family_id to canonical family ID
    const existingCitByNik = new Map(citizens.map((c) => [c.nik, c]));
    const resolvedIncomingCitizens: Citizen[] = incomingCitizens.map((c) => {
      const existing = existingCitByNik.get(c.nik);
      const canonicalId = existing ? existing.id : c.id;
      const canonicalFamilyId = familyIdRemap.get(c.family_id) || existing?.family_id || c.family_id;
      return {
        ...(existing || {}),
        ...c,
        id: canonicalId,
        family_id: canonicalFamilyId,
      };
    });

    // Merge into local state
    setFamilies((prev) => {
      const map = new Map(prev.map((f) => [f.no_kk, f]));
      resolvedIncomingFamilies.forEach((f) => map.set(f.no_kk, f));
      return Array.from(map.values());
    });

    setCitizens((prev) => {
      const map = new Map(prev.map((c) => [c.nik, c]));
      resolvedIncomingCitizens.forEach((c) => map.set(c.nik, c));
      return Array.from(map.values());
    });

    // Upsert to Supabase with canonical IDs
    if (isSupabaseConfigured && supabase) {
      try {
        const cleanFamilies = resolvedIncomingFamilies.map(sanitizeFamily);
        const cleanCitizens = resolvedIncomingCitizens.map(sanitizeCitizen);

        const { error: famErr } = await supabase.from('families').upsert(cleanFamilies, { onConflict: 'no_kk' });
        if (famErr) {
          console.warn('Supabase bulk families upsert error:', famErr);
          return {
            success: false,
            familiesCount: 0,
            citizensCount: 0,
            error: `Gagal sinkronisasi KK ke Supabase: ${famErr.message}`,
          };
        }

        const { error: citErr } = await supabase.from('citizens').upsert(cleanCitizens, { onConflict: 'nik' });
        if (citErr) {
          console.warn('Supabase bulk citizens upsert error:', citErr);
          return {
            success: false,
            familiesCount: resolvedIncomingFamilies.length,
            citizensCount: 0,
            error: `Gagal sinkronisasi Warga ke Supabase: ${citErr.message}`,
          };
        }

        setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
      } catch (err: any) {
        console.warn('Supabase bulk upsert error:', err);
      }
    }

    return {
      success: true,
      familiesCount: resolvedIncomingFamilies.length,
      citizensCount: resolvedIncomingCitizens.length,
    };
  };

  const syncToSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase URL & Anon Key belum terkonfigurasi di .env.local.' };
    }

    try {
      setIsSyncingWithSupabase(true);
      const cleanProfiles = allProfiles.map(sanitizeProfile);
      const cleanFamilies = families.map(sanitizeFamily);
      const cleanCitizens = citizens.map(sanitizeCitizen);
      const cleanNotes = notes.map(sanitizeNote);

      await supabase.from('profiles').upsert(cleanProfiles, { onConflict: 'id' });

      const { error: famErr } = await supabase.from('families').upsert(cleanFamilies, { onConflict: 'no_kk' });
      if (famErr) throw famErr;

      const { error: citErr } = await supabase.from('citizens').upsert(cleanCitizens, { onConflict: 'nik' });
      if (citErr) throw citErr;

      if (cleanNotes.length > 0) {
        const { error: noteErr } = await supabase.from('notes').upsert(cleanNotes, { onConflict: 'id' });
        if (noteErr) throw noteErr;
      }

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedAt(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);

      return {
        success: true,
        message: `Berhasil menyinkronkan ${families.length} KK, ${citizens.length} Warga, dan ${notes.length} Catatan ke Supabase Cloud!`,
      };
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      return {
        success: false,
        message: err.message || 'Gagal menyinkronkan ke Supabase.',
      };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  const fetchFromSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase URL & Anon Key belum terkonfigurasi di .env.local.', count: 0 };
    }

    try {
      setIsSyncingWithSupabase(true);
      const [profRes, famRes, citRes, noteRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('families').select('*').order('created_at', { ascending: false }),
        supabase.from('citizens').select('*').order('created_at', { ascending: false }),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
      ]);

      if (famRes.error) throw famRes.error;
      if (citRes.error) throw citRes.error;
      if (noteRes.error) throw noteRes.error;

      if (profRes.data && profRes.data.length > 0) {
        setAllProfiles(profRes.data);
        localStorage.setItem(STORAGE_KEYS.PROFILES_LIST, JSON.stringify(profRes.data));
      }

      let count = 0;
      if (famRes.data) {
        setFamilies(famRes.data);
        localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(famRes.data));
        count += famRes.data.length;
      }
      if (citRes.data) {
        setCitizens(citRes.data);
        localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citRes.data));
        count += citRes.data.length;
      }
      if (noteRes.data) {
        setNotes(noteRes.data);
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(noteRes.data));
      }

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedAt(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);

      return {
        success: true,
        message: `Berhasil memuat ${famRes.data?.length || 0} KK, ${citRes.data?.length || 0} Warga, dan ${noteRes.data?.length || 0} Catatan dari Supabase Cloud.`,
        count,
      };
    } catch (err: any) {
      console.error('Supabase fetch error:', err);
      return {
        success: false,
        message: err.message || 'Gagal memuat data dari Supabase.',
        count: 0,
      };
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  const getFamilyById = useCallback(
    (id: string) => {
      return families.find((f) => f.id === id);
    },
    [families]
  );

  const getCitizensByFamilyId = useCallback(
    (familyId: string) => {
      return citizens.filter((c) => c.family_id === familyId);
    },
    [citizens]
  );

  return (
    <AppContext.Provider
      value={{
        currentProfile,
        allProfiles,
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
        isSyncingWithSupabase,
        lastSyncedAt,
        refreshFromSupabase,
        addNote,
        updateNoteStatus,
        deleteNote,
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
