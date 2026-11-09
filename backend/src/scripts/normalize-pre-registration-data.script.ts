import { Logger } from '@nestjs/common';

import { AppDataSource } from '../data-source';
import {
  isValidLegacyContactData,
  normalizeLegacyDigits,
} from '../modules/website/content/pre-registrations/legacy-normalization';

interface LegacyPreRegistrationRow {
  id: string;
  studentNationalId: string;
  guardianPhone: string;
}

const logger = new Logger('PreRegistrationNormalization');

async function main(): Promise<void> {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  let transactionStarted = false;

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    transactionStarted = true;

    const rows = (await queryRunner.query(
      'SELECT id, "studentNationalId", "guardianPhone" FROM pre_registrations FOR UPDATE',
    )) as LegacyPreRegistrationRow[];

    let normalizedRows = 0;
    let invalidRows = 0;

    for (const row of rows) {
      const studentNationalId = normalizeLegacyDigits(row.studentNationalId);
      const guardianPhone = normalizeLegacyDigits(row.guardianPhone);

      if (
        studentNationalId !== row.studentNationalId ||
        guardianPhone !== row.guardianPhone
      ) {
        await queryRunner.query(
          'UPDATE pre_registrations SET "studentNationalId" = $1, "guardianPhone" = $2 WHERE id = $3',
          [studentNationalId, guardianPhone, row.id],
        );
        normalizedRows += 1;
      }

      if (!isValidLegacyContactData(studentNationalId, guardianPhone))
        invalidRows += 1;
    }

    await queryRunner.commitTransaction();
    transactionStarted = false;
    logger.log(
      `Pre-registration normalization complete: ${normalizedRows} rows normalized; ${invalidRows} rows still have invalid contact formats.`,
    );
  } catch (error) {
    if (transactionStarted) await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  logger.error(
    'Pre-registration normalization failed.',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
