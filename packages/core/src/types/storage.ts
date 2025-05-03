import type { CVData } from '@dzb-cv/common';

export interface Storage {
  read(key: string): Promise<CVData | null>;
  write(key: string, data: CVData): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}

