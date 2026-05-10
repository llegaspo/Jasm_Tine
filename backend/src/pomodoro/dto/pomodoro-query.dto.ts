import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const pomodoroHistoryQuerySchema = z
  .object({
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

export type PomodoroHistoryQueryDto = z.infer<
  typeof pomodoroHistoryQuerySchema
>;
