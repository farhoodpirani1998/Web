export enum Locale {
  FA = 'fa',
  EN = 'en',
}

export const DEFAULT_LOCALE = Locale.FA;

/**
 * Convention, not enforcement: a translatable field is modeled as
 * `{ fa: string; en?: string }` on the entity. Modules adopt this
 * incrementally — nothing here forces every field to be translatable.
 */
export type Translatable<T = string> = Partial<Record<Locale, T>> & {
  [DEFAULT_LOCALE]: T;
};
