import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

const zBooleanQuery = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true');

export const taskQuerySchema = z
  .object({
    completed: zBooleanQuery.optional(),
    priority: z.coerce.number().int().optional(),
    category: z.string().trim().min(1).optional(),
    date: zDateString.optional(),
  })
  .strict();

export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
