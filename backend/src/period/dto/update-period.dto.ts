import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const createSymptomLogSchema = z
  .object({
    date: zDateString,
    symptom: z.string().trim().min(1),
    severity: z.number().int().min(1).max(10).nullable().optional(),
    note: z.string().trim().min(1).nullable().optional(),
    cycleEntryId: z
      .string()
      .regex(/^c[a-z0-9]{24}$/, 'Expected a valid CUID')
      .optional(),
  })
  .strict();

export const cycleSymptomQuerySchema = z
  .object({
    date: zDateString.optional(),
    range: z.enum(['week', 'month']).optional(),
    startDate: zDateString.optional(),
    endDate: zDateString.optional(),
  })
  .strict()
  .refine(
    ({ startDate, endDate }) => {
      if (!startDate || !endDate) {
        return true;
      }

      return startDate <= endDate;
    },
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    },
  );

export type CreateSymptomLogInput = z.infer<typeof createSymptomLogSchema>;
export type CycleSymptomQueryDto = z.infer<typeof cycleSymptomQuerySchema>;

export class UpdatePeriodDto {}
