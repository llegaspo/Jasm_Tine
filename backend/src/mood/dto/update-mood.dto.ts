import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const moodLogQuerySchema = z
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

export type MoodLogQueryDto = z.infer<typeof moodLogQuerySchema>;

export class UpdateMoodDto {}
