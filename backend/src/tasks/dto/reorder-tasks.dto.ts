import { z } from 'zod';
import { zCuid, zDecimal } from '../../common/validation/zod-schemas';

export const reorderTasksSchema = z
  .array(
    z
      .object({
        id: zCuid,
        sortOrder: zDecimal(),
      })
      .strict(),
  )
  .min(1, 'At least one task reorder item is required')
  .refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    {
      message: 'Task IDs must be unique',
    },
  );

export type ReorderTasksDto = z.infer<typeof reorderTasksSchema>;
