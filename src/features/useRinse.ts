import { useCallback, useEffect, useRef, useState } from 'react';
import type { RinseData } from '../domain/types';
import type { RinseRepository } from '../domain/repository';
import { PreferencesRinseRepository } from '../infra/preferencesRepository';
import {
  addItem,
  cleanItem,
  createInitialData,
  removeItem,
  undoCleaning,
  updateItem,
} from '../domain/rinse';

export interface RinseStore {
  data: RinseData;
  ready: boolean;
  error: string | null;
  clean: (itemId: string) => void;
  undo: (historyId: string) => void;
  add: (draft: { name: string; interval: number; lastCleaned: string }) => void;
  edit: (itemId: string, draft: { name: string; interval: number; lastCleaned: string }) => void;
  remove: (itemId: string) => void;
}

export function useRinse(repository?: RinseRepository): RinseStore {
  const repositoryRef = useRef(repository ?? new PreferencesRinseRepository());
  const [data, setData] = useState<RinseData>({ items: [], history: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await repositoryRef.current.load();
        if (cancelled) return;
        const initial = stored ?? createInitialData();
        setData(initial);
        if (!stored) await repositoryRef.current.save(initial);
      } catch {
        if (cancelled) return;
        setError('Rinse could not open its local library. Changes will not be kept.');
        setData(createInitialData());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveQueue.current = saveQueue.current
      .then(() => repositoryRef.current.save(data))
      .catch(() => setError('Rinse could not save to this device.'));
  }, [data, ready]);

  const clean = useCallback((itemId: string) => {
    setData((current) => cleanItem(current, itemId).data);
  }, []);

  const undo = useCallback((historyId: string) => {
    setData((current) => undoCleaning(current, historyId));
  }, []);

  const add = useCallback((draft: { name: string; interval: number; lastCleaned: string }) => {
    setData((current) => addItem(current, draft));
  }, []);

  const edit = useCallback(
    (itemId: string, draft: { name: string; interval: number; lastCleaned: string }) => {
      setData((current) => updateItem(current, itemId, draft));
    },
    [],
  );

  const remove = useCallback((itemId: string) => {
    setData((current) => removeItem(current, itemId));
  }, []);

  return { data, ready, error, clean, undo, add, edit, remove };
}
