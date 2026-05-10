import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const createCycleEntrySchema = z
  .object({
    startDate: zDateString,
    endDate: zDateString.nullable().optional(),
    cycleDay: z.number().int().min(1).max(120).nullable().optional(),
    phase: z.string().trim().min(1).nullable().optional(),
    flow: z.string().trim().min(1).nullable().optional(),
    note: z.string().trim().min(1).nullable().optional(),
  })
  .strict()
  .refine(
    ({ startDate, endDate }) => {
      if (!endDate) {
        return true;
      }

      return startDate <= endDate;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    },
  );

export type CreateCycleEntryInput = z.infer<typeof createCycleEntrySchema>;

export class CreatePeriodDto {
  startDate: Date;
  endDate?: Date | null;
  cycleDay?: number | null;
  phase?: string | null;
  flow?: string | null;
  note?: string | null;
}
