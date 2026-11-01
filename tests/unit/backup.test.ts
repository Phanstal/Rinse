import { describe, expect, it } from 'vitest';
import { BACKUP_FORMAT, BACKUP_VERSION, createBackup, parseBackup } from '../../src/domain/backup';
import type { RinseData } from '../../src/domain/types';

const data: RinseData = {
  items: [
    { id: 'kitchen', name: 'Kitchen counter', interval: 3, lastCleaned: '2026-10-22' },
    { id: 'fridge', name: 'Fridge', interval: 30, lastCleaned: '2026-10-26', cleanedAt: 123 },
  ],
  history: [
    {
      id: 'entry',
      itemId: 'kitchen',
      name: 'Kitchen counter',
      previousDate: '2026-10-19',
      cleanedDate: '2026-10-22',
      createdAt: 456,
    },
  ],
};

describe('local backups', () => {
  it('round-trips a wrapped backup', () => {
    const serialized = createBackup(data, new Date('2026-10-27T12:00:00.000Z'));
    const payload = JSON.parse(serialized) as Record<string, unknown>;
    expect(payload.format).toBe(BACKUP_FORMAT);
    expect(payload.version).toBe(BACKUP_VERSION);

    const parsed = parseBackup(serialized);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data).toEqual(data);
  });

  it('accepts a bare items/history snapshot', () => {
    const parsed = parseBackup(JSON.stringify(data));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data.items).toHaveLength(2);
  });

  it('rejects empty, malformed and unsupported backups', () => {
    expect(parseBackup('')).toMatchObject({ ok: false });
    expect(parseBackup('not json')).toMatchObject({ ok: false });
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 99, data }))).toMatchObject(
      { ok: false },
    );
    expect(
      parseBackup(
        JSON.stringify({
          format: BACKUP_FORMAT,
          version: BACKUP_VERSION,
          data: { items: [{ id: 'broken' }], history: [] },
        }),
      ),
    ).toMatchObject({ ok: false });
  });

  it('rejects duplicate item ids instead of replacing the first entry', () => {
    const duplicate = {
      items: [
        { id: 'same', name: 'One', interval: 7, lastCleaned: '2026-10-20' },
        { id: 'same', name: 'Two', interval: 7, lastCleaned: '2026-10-21' },
      ],
      history: [],
    };
    expect(parseBackup(JSON.stringify(duplicate))).toMatchObject({ ok: false });
  });

  it('normalizes item names and clamps intervals', () => {
    const parsed = parseBackup(
      JSON.stringify({
        items: [{ id: 'one', name: '  Hallway  ', interval: 999, lastCleaned: '2026-10-20' }],
        history: [],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.items[0].name).toBe('Hallway');
      expect(parsed.data.items[0].interval).toBe(365);
    }
  });
});
