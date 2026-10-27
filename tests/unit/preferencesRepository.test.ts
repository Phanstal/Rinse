import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { PreferencesRinseRepository, normalizeData } from '../../src/infra/preferencesRepository';
import type { RinseData } from '../../src/domain/types';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

const get = vi.mocked(Preferences.get);
const set = vi.mocked(Preferences.set);

const valid: RinseData = {
  items: [
    { id: 'kitchen', name: 'Kitchen counter', interval: 3, lastCleaned: '2026-10-22' },
    { id: 'fridge', name: 'Fridge', interval: 30, lastCleaned: '2026-10-26', cleanedAt: 123 },
  ],
  history: [
    {
      id: 'entry',
      itemId: 'kitchen',
      name: 'Kitchen counter',
      previousDate: '2026-10-20',
      cleanedDate: '2026-10-22',
      createdAt: 1234,
    },
  ],
};

describe('PreferencesRinseRepository', () => {
  beforeEach(() => {
    get.mockReset();
    set.mockReset();
  });

  it('returns null when the library has never been written', async () => {
    get.mockResolvedValue({ value: null });
    await expect(new PreferencesRinseRepository().load()).resolves.toBeNull();
  });

  it('saves items and history as separate snapshot keys', async () => {
    set.mockResolvedValue();
    await new PreferencesRinseRepository().save(valid);
    expect(set).toHaveBeenCalledWith({
      key: 'rinse.items.v1',
      value: JSON.stringify(valid.items),
    });
    expect(set).toHaveBeenCalledWith({
      key: 'rinse.history.v1',
      value: JSON.stringify(valid.history),
    });
  });

  it('loads and normalizes both snapshots', async () => {
    get.mockImplementation(async ({ key }) => ({
      value: key === 'rinse.items.v1' ? JSON.stringify(valid.items) : JSON.stringify(valid.history),
    }));
    await expect(new PreferencesRinseRepository().load()).resolves.toEqual(valid);
  });

  it('returns null for corrupt or invalid item snapshots', async () => {
    get.mockImplementation(async ({ key }) => ({
      value: key === 'rinse.items.v1' ? '{not json' : '[]',
    }));
    await expect(new PreferencesRinseRepository().load()).resolves.toBeNull();

    get.mockImplementation(async ({ key }) => ({
      value:
        key === 'rinse.items.v1'
          ? JSON.stringify([{ id: 'bad', name: '', interval: 7, lastCleaned: '2026-10-22' }])
          : '[]',
    }));
    await expect(new PreferencesRinseRepository().load()).resolves.toBeNull();
  });
});

describe('normalizeData', () => {
  it('drops invalid history entries but keeps valid items', () => {
    const normalized = normalizeData({
      ...valid,
      history: [...valid.history, { nope: true }],
    });
    expect(normalized?.history).toEqual(valid.history);
    expect(normalized?.items).toHaveLength(2);
  });

  it('rejects a non-object or missing arrays', () => {
    expect(normalizeData(null)).toBeNull();
    expect(normalizeData({ items: [] })).toBeNull();
    expect(normalizeData({ items: [], history: [] })).toEqual({ items: [], history: [] });
  });
});
