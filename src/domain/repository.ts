import type { RinseData } from './types';

export interface RinseRepository {
  load(): Promise<RinseData | null>;
  save(data: RinseData): Promise<void>;
}
