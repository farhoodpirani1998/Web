import { Module } from '@nestjs/common';

/**
 * i18n has no module dependencies today. It currently exports pure
 * types/enums (no runtime providers needed yet) — the module exists so
 * content modules have an explicit, auditable import when they adopt
 * the Translatable<T> convention.
 */
@Module({})
export class I18nModule {}
