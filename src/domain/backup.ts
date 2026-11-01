import type { RinseData } from './types';
import { normalizeData } from './normalize';

export const BACKUP_FORMAT = 'rinse-backup';
export const BACKUP_VERSION = 1;
const MAX_BACKUP_LENGTH = 2_000_000;

export interface RinseBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: RinseData;
}

export type BackupParseResult = { ok: true; data: RinseData } | { ok: false; error: string };

export function createBackup(data: RinseData, now: Date = new Date()): string {
  const backup: RinseBackup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): BackupParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: 'Paste a Rinse backup first.' };
  if (trimmed.length > MAX_BACKUP_LENGTH) {
    return { ok: false, error: 'That backup is too large for Rinse to read.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return { ok: false, error: 'That does not look like a Rinse backup.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'That does not look like a Rinse backup.' };
  }

  const candidate = parsed as Record<string, unknown>;
  if (candidate.format === BACKUP_FORMAT) {
    if (candidate.version !== BACKUP_VERSION) {
      return { ok: false, error: 'This backup was made by a newer version of Rinse.' };
    }
    const data = normalizeData(candidate.data);
    return data
      ? { ok: true, data }
      : { ok: false, error: 'The backup is damaged or uses an unsupported format.' };
  }

  // Accept a bare { items, history } snapshot as well; it is useful for manual
  // exports and makes the format forgiving when restoring an older copy.
  const data = normalizeData(candidate);
  return data
    ? { ok: true, data }
    : { ok: false, error: 'The backup is damaged or uses an unsupported format.' };
}
