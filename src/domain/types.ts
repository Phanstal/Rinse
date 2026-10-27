export type CleaningStatus = 'Overdue' | 'Due' | 'Due Soon' | 'Fresh';

export interface CleaningItem {
  id: string;
  name: string;
  interval: number;
  lastCleaned: string;
  cleanedAt?: number;
}

export interface CleaningHistoryEntry {
  id: string;
  itemId: string;
  name: string;
  previousDate: string;
  cleanedDate: string;
  createdAt: number;
}

export interface RinseData {
  items: CleaningItem[];
  history: CleaningHistoryEntry[];
}

export interface ItemDraft {
  name: string;
  interval: number;
  lastCleaned: string;
}

export type HomeMode = 'bubbles' | 'list';
export type AppView = 'home' | 'history';
