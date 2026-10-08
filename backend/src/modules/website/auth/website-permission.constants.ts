/**
 * Metadata key shared by the decorator (which sets it) and the guard
 * (which reads it). Lives in its own file so neither of those two files
 * has to import the other — decorator.ts previously imported guard.ts
 * for UseGuards() while guard.ts imported decorator.ts for this key,
 * a circular dependency between the two modules.
 */
export const PERMISSION_KEY = 'website_permission';
