import { Preferences } from '@capacitor/preferences';
import type { RinseRepository } from '../domain/repository';
import type { RinseData } from '../domain/types';
import { normalizeData } from '../domain/normalize';

const ITEMS_KEY = 'rinse.items.v1';
const HISTORY_KEY = 'rinse.history.v1';

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

export { normalizeData } from '../domain/normalize';
