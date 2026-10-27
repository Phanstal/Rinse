import { describe, expect, it } from 'vitest';
import {
  addItem,
  cleanItem,
  createSampleItems,
  cycleColor,
  dateAtMidnight,
  dueCopy,
  elapsedDays,
  formatDate,
  remainingCopy,
  removeItem,
  sortItems,
  statusFor,
  summaryCopy,
  toDateKey,
  undoCleaning,
  updateItem,
  validateDraft,
} from '../../src/domain/rinse';
import type { RinseData } from '../../src/domain/types';

const now = new Date(2026, 9, 27, 15, 0, 0);
const sample = () => createSampleItems(now);

function data(): RinseData {
  return { items: sample(), history: [] };
}

describe('date and cycle copy', () => {
  it('uses local calendar days rather than UTC slices', () => {
    expect(toDateKey(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
    expect(dateAtMidnight('2026-01-02')).toBe(new Date(2026, 0, 2).getTime());
    expect(formatDate('2026-10-22')).toBe('Oct 22');
  });

  it('seeds the same eight spaces as the reference', () => {
    const items = sample();
    expect(items.map((item) => item.name)).toEqual([
      'Kitchen counter',
      'Bathroom',
      'Floors',
      'Bedsheets',
      'Shower',
      'Mirrors',
      'Towels',
      'Fridge',
    ]);
    expect(items[0].lastCleaned).toBe('2026-10-22');
    expect(items[7].interval).toBe(30);
  });

  it('describes the seeded cycles exactly like the reference', () => {
    const items = sample();
    const kitchen = items[0];
    expect(elapsedDays(kitchen, now)).toBe(5);
    expect(remainingCopy(kitchen, now)).toBe('2d overdue');
    expect(dueCopy(kitchen, now)).toBe('2 days overdue');
    expect(statusFor(kitchen, now)).toBe('Overdue');
    expect(remainingCopy(items[2], now)).toBe('1 day left');
    expect(dueCopy(items[2], now)).toBe('Due tomorrow');
    expect(statusFor(items[2], now)).toBe('Due Soon');
    expect(summaryCopy(items, now)).toBe('3 areas ready for care');
  });

  it('handles due today, due tomorrow, future and singular intervals', () => {
    const dueToday = { id: 'a', name: 'A', interval: 10, lastCleaned: '2026-10-17' };
    expect(dueCopy(dueToday, now)).toBe('Due today');
    expect(remainingCopy(dueToday, now)).toBe('Due today');
    expect(statusFor(dueToday, now)).toBe('Due');

    const tomorrow = { id: 'b', name: 'B', interval: 1, lastCleaned: '2026-10-27' };
    expect(dueCopy(tomorrow, now)).toBe('Due tomorrow');
    expect(remainingCopy(tomorrow, now)).toBe('1 day left');

    const later = { id: 'c', name: 'C', interval: 30, lastCleaned: '2026-10-26' };
    expect(dueCopy(later, now)).toBe('Due in 29 days');
    expect(statusFor(later, now)).toBe('Fresh');
    expect(summaryCopy([kitchenWithInterval(1)], now)).toBe('1 area ready for care');
  });

  it('sorts by urgency and then by the oldest cleaning time', () => {
    const items = sample();
    const sorted = sortItems(items, now);
    expect(sorted[0].name).toBe('Kitchen counter');
    expect(sorted[1].name).toBe('Bathroom');
    expect(sorted[2].name).toBe('Floors');
    const tied = [
      { id: 'newer', name: 'Newer', interval: 7, lastCleaned: '2026-10-20', cleanedAt: 20 },
      { id: 'older', name: 'Older', interval: 7, lastCleaned: '2026-10-20', cleanedAt: 10 },
    ];
    expect(sortItems(tied, now).map((item) => item.id)).toEqual(['older', 'newer']);
  });

  it('interpolates the seven bubble colors without leaving the palette', () => {
    expect(cycleColor(0, 1)).toBe('#225F96');
    expect(cycleColor(0, 7)).toBe('#225f96');
    expect(cycleColor(6, 7)).toBe('#fcfcfa');
    expect(cycleColor(3, 7)).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

function kitchenWithInterval(interval: number) {
  return { id: 'k', name: 'Kitchen', interval, lastCleaned: '2026-10-22' };
}

describe('editing and cleaning', () => {
  it('validates drafts before saving', () => {
    expect(validateDraft({ name: '', interval: 7, lastCleaned: '2026-10-22' }, now)).toBe(
      'Give this cleaning cycle a name.',
    );
    expect(validateDraft({ name: 'A', interval: 0, lastCleaned: '2026-10-22' }, now)).toBe(
      'Choose an interval of at least one day.',
    );
    expect(validateDraft({ name: 'A', interval: 366, lastCleaned: '2026-10-22' }, now)).toBe(
      'Choose an interval of 365 days or less.',
    );
    expect(validateDraft({ name: 'A', interval: 7, lastCleaned: '2026-10-28' }, now)).toBe(
      'The last cleaned date cannot be in the future.',
    );
    expect(
      validateDraft({ name: '  A  ', interval: 7, lastCleaned: '2026-10-22' }, now),
    ).toBeNull();
  });

  it('adds, edits and removes an item without touching history', () => {
    const initial = data();
    const added = addItem(initial, { name: ' Oven ', interval: 30, lastCleaned: '2026-10-20' });
    expect(added.items).toHaveLength(9);
    expect(added.items[8].name).toBe('Oven');
    expect(added.items[8].cleanedAt).toBeUndefined();

    const edited = updateItem(added, added.items[8].id, {
      name: 'Oven and hob',
      interval: 14,
      lastCleaned: '2026-10-21',
    });
    expect(edited.items[8].name).toBe('Oven and hob');
    expect(edited.items[8].interval).toBe(14);
    expect(edited.items[8].lastCleaned).toBe('2026-10-21');

    expect(removeItem(edited, edited.items[8].id).items).toHaveLength(8);
    expect(removeItem(edited, edited.items[8].id).history).toEqual([]);
  });

  it('records a cleaning and restores the previous date on undo', () => {
    const initial = data();
    const { data: cleaned, entry } = cleanItem(initial, 'kitchen', now);
    expect(entry).not.toBeNull();
    expect(entry?.previousDate).toBe('2026-10-22');
    expect(entry?.cleanedDate).toBe('2026-10-27');
    const kitchen = cleaned.items.find((item) => item.id === 'kitchen');
    expect(kitchen?.lastCleaned).toBe('2026-10-27');
    expect(kitchen?.cleanedAt).toBe(now.getTime());
    expect(cleaned.history).toHaveLength(1);

    const restored = undoCleaning(cleaned, entry!.id);
    expect(restored.history).toHaveLength(0);
    expect(restored.items.find((item) => item.id === 'kitchen')?.lastCleaned).toBe('2026-10-22');
    expect(restored.items.find((item) => item.id === 'kitchen')?.cleanedAt).toBeUndefined();
  });

  it('ignores unknown items when cleaning or undoing', () => {
    const initial = data();
    expect(cleanItem(initial, 'missing', now).entry).toBeNull();
    expect(undoCleaning(initial, 'missing')).toEqual(initial);
  });
});
