import { MigrationInterface, QueryRunner } from 'typeorm';

const EMBEDDED_COLUMNS: Array<{
  table: string;
  columns: Array<[string, string]>;
}> = [
  {
    table: 'site_settings',
    columns: [
      ['defaultSeoMetaTitle', 'defaultSeoMetatitle'],
      ['defaultSeoMetaDescription', 'defaultSeoMetadescription'],
      ['defaultSeoOgImageUrl', 'defaultSeoOgimageurl'],
      ['defaultSeoCanonicalUrl', 'defaultSeoCanonicalurl'],
      ['featureFlagsNewsEnabled', 'featureFlagsNewsenabled'],
      ['featureFlagsGalleryEnabled', 'featureFlagsGalleryenabled'],
      ['featureFlagsTestimonialsEnabled', 'featureFlagsTestimonialsenabled'],
      ['featureFlagsFaqEnabled', 'featureFlagsFaqenabled'],
      ['featureFlagsEventsEnabled', 'featureFlagsEventsenabled'],
      ['featureFlagsCtaEnabled', 'featureFlagsCtaenabled'],
    ],
  },
  ...[
    'about_page',
    'calendar_events',
    'campuses',
    'news_articles',
    'static_pages',
    'teachers',
  ].map((table) => ({
    table,
    columns: [
      ['seoMetaTitle', 'seoMetatitle'],
      ['seoMetaDescription', 'seoMetadescription'],
      ['seoOgImageUrl', 'seoOgimageurl'],
      ['seoCanonicalUrl', 'seoCanonicalurl'],
    ] as Array<[string, string]>,
  })),
];

export class FixEmbeddedColumnNames1794210000000 implements MigrationInterface {
  name = 'FixEmbeddedColumnNames1794210000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of EMBEDDED_COLUMNS) {
      if (!(await queryRunner.hasTable(table))) continue;

      for (const [legacyName, entityName] of columns) {
        if (
          (await queryRunner.hasColumn(table, legacyName)) &&
          !(await queryRunner.hasColumn(table, entityName))
        ) {
          await queryRunner.renameColumn(table, legacyName, entityName);
        }
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const { table, columns } of [...EMBEDDED_COLUMNS].reverse()) {
      if (!(await queryRunner.hasTable(table))) continue;

      for (const [legacyName, entityName] of [...columns].reverse()) {
        if (
          (await queryRunner.hasColumn(table, entityName)) &&
          !(await queryRunner.hasColumn(table, legacyName))
        ) {
          await queryRunner.renameColumn(table, entityName, legacyName);
        }
      }
    }
  }
}
