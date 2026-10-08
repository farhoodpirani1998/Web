import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

/**
 * Shared reorder helper. A drag-and-drop admin UI produces an ordered
 * array of IDs; this writes the resulting `position` integers in one
 * transaction, rather than each content module reimplementing the same
 * loop.
 */
@Injectable()
export class OrderingService {
  async reorder(
    manager: EntityManager,
    tableName: string,
    orderedIds: string[],
  ): Promise<void> {
    await manager.transaction(async (trx) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          trx
            .createQueryBuilder()
            .update(tableName)
            .set({ position: index })
            .where('id = :id', { id })
            .execute(),
        ),
      );
    });
  }
}
