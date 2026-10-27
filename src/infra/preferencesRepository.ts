import { Preferences } from '@capacitor/preferences';
import type { RinseRepository } from '../domain/repository';
import type { CleaningHistoryEntry, CleaningItem, RinseData } from '../domain/types';
import { clampInterval, isRinseData } from '../domain/rinse';

const ITEMS_KEY = 'rinse.items.v1';
const HISTORY_KEY = 'rinse.history.v1';

function normalizeItem(value: unknown): CleaningItem | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CleaningItem>;
  if (typeof candidate.id !== 'string' || !candidate.id) return null;
  if (typeof candidate.name !== 'string' || !candidate.name.trim()) return null;
  if (typeof candidate.interval !== 'number' || !Number.isFinite(candidate.interval)) return null;
  if (typeof candidate.lastCleaned !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate.lastCleaned)) return null;
  return {
    id: candidate.id,
    name: candidate.name.trim(),
    interval: clampInterval(candidate.interval),
    lastCleaned: candidate.lastCleaned,
    ...(typeof candidate.cleanedAt === 'number' ? { cleanedAt: candidate.cleanedAt } : {}),
  };
}

function normalizeHistoryEntry(value: unknown): CleaningHistoryEntry | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CleaningHistoryEntry>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.itemId !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.previousDate !== 'string' ||
    typeof candidate.cleanedDate !== 'string' ||
    typeof candidate.createdAt !== 'number'
  ) {
    return null;
  }
  return {
    id: candidate.id,
    itemId: candidate.itemId,
    name: candidate.name,
    previousDate: candidate.previousDate,
    cleanedDate: candidate.cleanedDate,
    createdAt: candidate.createdAt,
  };
}

export function normalizeData(value: unknown): RinseData | null {
  if (!isRinseData(value)) return null;
  const items = value.items
    .map(normalizeItem)
    .filter((item): item is CleaningItem => item !== null);
  const history = value.history
    .map(normalizeHistoryEntry)
    .filter((entry): entry is CleaningHistoryEntry => entry !== null);
  if (items.length !== value.items.length) return null;
  return { items, history };
}

async function readJson(key: string): Promise<unknown> {
  const { value } = await Preferences.get({ key });
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export class PreferencesRinseRepository implements RinseRepository {
  async load(): Promise<RinseData | null> {
    const [items, history] = await Promise.all([readJson(ITEMS_KEY), readJson(HISTORY_KEY)]);
    if (!Array.isArray(items)) return null;
    const data = normalizeData({ items, history: Array.isArray(history) ? history : [] });
    return data;
  }

  async save(data: RinseData): Promise<void> {
    await Promise.all([
      Preferences.set({ key: ITEMS_KEY, value: JSON.stringify(data.items) }),
      Preferences.set({ key: HISTORY_KEY, value: JSON.stringify(data.history) }),
    ]);
  }
}
