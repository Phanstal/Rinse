import type {
  CleaningHistoryEntry,
  CleaningItem,
  CleaningStatus,
  ItemDraft,
  RinseData,
} from './types';

export const DAY_MS = 86_400_000;
export const MIN_INTERVAL = 1;
export const MAX_INTERVAL = 365;
export const VISIBLE_BUBBLES = 9;

export const CYCLE_COLORS = [
  '#225F96',
  '#65A9DC',
  '#87C1E8',
  '#A8D7F5',
  '#C5E5F4',
  '#DDF1F6',
  '#FCFCFA',
] as const;

export interface ScatterSlot {
  x: number;
  y: number;
}

export const SCATTER_SLOTS: ScatterSlot[] = [
  { x: 50, y: 50 },
  { x: 84, y: 50 },
  { x: 84, y: 17 },
  { x: 50, y: 17 },
  { x: 16, y: 17 },
  { x: 16, y: 50 },
  { x: 16, y: 83 },
  { x: 50, y: 83 },
  { x: 84, y: 83 },
];

export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateAtMidnight(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function startOfToday(now: Date = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function daysAgoKey(days: number, now: Date = new Date()): string {
  const value = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  return toDateKey(value);
}

export function createSampleItems(now: Date = new Date()): CleaningItem[] {
  return [
    { id: 'kitchen', name: 'Kitchen counter', interval: 3, lastCleaned: daysAgoKey(5, now) },
    { id: 'bathroom', name: 'Bathroom', interval: 7, lastCleaned: daysAgoKey(8, now) },
    { id: 'floors', name: 'Floors', interval: 7, lastCleaned: daysAgoKey(6, now) },
    { id: 'bedsheets', name: 'Bedsheets', interval: 14, lastCleaned: daysAgoKey(10, now) },
    { id: 'shower', name: 'Shower', interval: 7, lastCleaned: daysAgoKey(3, now) },
    { id: 'mirrors', name: 'Mirrors', interval: 7, lastCleaned: daysAgoKey(2, now) },
    { id: 'towels', name: 'Towels', interval: 7, lastCleaned: daysAgoKey(1, now) },
    { id: 'fridge', name: 'Fridge', interval: 30, lastCleaned: daysAgoKey(1, now) },
  ];
}

export function createInitialData(now: Date = new Date()): RinseData {
  return { items: createSampleItems(now), history: [] };
}

export function elapsedDays(item: CleaningItem, now: Date = new Date()): number {
  return Math.max(0, Math.floor((startOfToday(now) - dateAtMidnight(item.lastCleaned)) / DAY_MS));
}

export function cycleProgress(item: CleaningItem, now: Date = new Date()): number {
  return elapsedDays(item, now) / item.interval;
}

export function urgency(item: CleaningItem, now: Date = new Date()): number {
  return cycleProgress(item, now) - 1;
}

export function statusFor(item: CleaningItem, now: Date = new Date()): CleaningStatus {
  const score = urgency(item, now);
  if (score > 0) return 'Overdue';
  if (score >= -0.05) return 'Due';
  if (score >= -0.3) return 'Due Soon';
  return 'Fresh';
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(dateAtMidnight(value)),
  );
}

export function dueDate(item: CleaningItem): Date {
  return new Date(dateAtMidnight(item.lastCleaned) + item.interval * DAY_MS);
}

export function dueCopy(item: CleaningItem, now: Date = new Date()): string {
  const days = Math.ceil((dueDate(item).getTime() - now.getTime()) / DAY_MS);
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export function remainingCopy(item: CleaningItem, now: Date = new Date()): string {
  const remaining = item.interval - elapsedDays(item, now);
  if (remaining < 0) return `${Math.abs(remaining)}d overdue`;
  if (remaining === 0) return 'Due today';
  return `${remaining} day${remaining === 1 ? '' : 's'} left`;
}

export function intervalCopy(days: number): string {
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function sortItems(items: CleaningItem[], now: Date = new Date()): CleaningItem[] {
  return [...items].sort(
    (a, b) => urgency(b, now) - urgency(a, now) || (a.cleanedAt ?? 0) - (b.cleanedAt ?? 0),
  );
}

export function visibleItems(items: CleaningItem[], now: Date = new Date()): CleaningItem[] {
  return sortItems(items, now).slice(0, VISIBLE_BUBBLES);
}

export function readyForCare(items: CleaningItem[], now: Date = new Date()): number {
  return items.filter((item) => urgency(item, now) >= -0.25).length;
}

export function summaryCopy(items: CleaningItem[], now: Date = new Date()): string {
  const count = readyForCare(items, now);
  if (count === 0) return 'No areas ready for care';
  return `${count} area${count === 1 ? '' : 's'} ready for care`;
}

export function scatterPosition(index: number): ScatterSlot {
  return SCATTER_SLOTS[index] ?? SCATTER_SLOTS[SCATTER_SLOTS.length - 1];
}

function interpolateColor(from: string, to: string, amount: number): string {
  return `#${[1, 3, 5]
    .map((offset) => {
      const start = Number.parseInt(from.slice(offset, offset + 2), 16);
      const end = Number.parseInt(to.slice(offset, offset + 2), 16);
      return Math.round(start + (end - start) * amount)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

export function cycleColor(index: number, total: number): string {
  if (total <= 1) return CYCLE_COLORS[0];
  const position = (index / (total - 1)) * (CYCLE_COLORS.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(CYCLE_COLORS.length - 1, Math.ceil(position));
  return interpolateColor(CYCLE_COLORS[lower], CYCLE_COLORS[upper], position - lower);
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `rinse-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createItem(draft: ItemDraft): CleaningItem {
  return {
    id: createId(),
    name: draft.name.trim(),
    interval: clampInterval(draft.interval),
    lastCleaned: draft.lastCleaned,
  };
}

export function clampInterval(value: number): number {
  if (!Number.isFinite(value)) return MIN_INTERVAL;
  return Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(value)));
}

export function validateDraft(draft: ItemDraft, now: Date = new Date()): string | null {
  if (!draft.name.trim()) return 'Give this cleaning cycle a name.';
  if (!Number.isInteger(draft.interval) || draft.interval < MIN_INTERVAL) {
    return 'Choose an interval of at least one day.';
  }
  if (draft.interval > MAX_INTERVAL) return 'Choose an interval of 365 days or less.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.lastCleaned)) return 'Choose the last cleaned date.';
  if (dateAtMidnight(draft.lastCleaned) > startOfToday(now)) {
    return 'The last cleaned date cannot be in the future.';
  }
  return null;
}

export function addItem(data: RinseData, draft: ItemDraft): RinseData {
  return { ...data, items: [...data.items, createItem(draft)] };
}

export function updateItem(data: RinseData, id: string, draft: ItemDraft): RinseData {
  const item = data.items.find((entry) => entry.id === id);
  if (!item) return data;
  const updated: CleaningItem = {
    ...item,
    name: draft.name.trim(),
    interval: clampInterval(draft.interval),
    lastCleaned: draft.lastCleaned,
  };
  return { ...data, items: data.items.map((entry) => (entry.id === id ? updated : entry)) };
}

export function removeItem(data: RinseData, id: string): RinseData {
  return { ...data, items: data.items.filter((entry) => entry.id !== id) };
}

export function cleanItem(
  data: RinseData,
  itemId: string,
  now: Date = new Date(),
): { data: RinseData; entry: CleaningHistoryEntry | null } {
  const item = data.items.find((entry) => entry.id === itemId);
  if (!item) return { data, entry: null };
  const cleanedDate = toDateKey(now);
  const entry: CleaningHistoryEntry = {
    id: createId(),
    itemId: item.id,
    name: item.name,
    previousDate: item.lastCleaned,
    cleanedDate,
    createdAt: now.getTime(),
  };
  return {
    data: {
      items: data.items.map((entry) =>
        entry.id === itemId
          ? { ...entry, lastCleaned: cleanedDate, cleanedAt: now.getTime() }
          : entry,
      ),
      history: [entry, ...data.history],
    },
    entry,
  };
}

export function undoCleaning(data: RinseData, historyId: string): RinseData {
  const entry = data.history.find((candidate) => candidate.id === historyId);
  if (!entry) return data;
  return {
    items: data.items.map((item) =>
      item.id === entry.itemId
        ? { ...item, lastCleaned: entry.previousDate, cleanedAt: undefined }
        : item,
    ),
    history: data.history.filter((candidate) => candidate.id !== historyId),
  };
}

export function isRinseData(value: unknown): value is RinseData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<RinseData>;
  return Array.isArray(candidate.items) && Array.isArray(candidate.history);
}
