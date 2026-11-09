import { ReadStream } from 'node:fs';

export const TEXTBOOK_STORAGE = Symbol('TEXTBOOK_STORAGE');

export interface TextbookStoredFile {
  stream: ReadStream;
  size: number;
  etag: string;
  start: number;
  end: number;
}

export interface TextbookByteRange {
  start: number;
  end: number;
}

export interface TextbookStorage {
  save(
    data: Buffer,
    originalName: string,
  ): Promise<{ key: string; size: number; checksum: string }>;
  remove(key: string): Promise<void>;
  open(key: string, range?: TextbookByteRange): Promise<TextbookStoredFile>;
}
