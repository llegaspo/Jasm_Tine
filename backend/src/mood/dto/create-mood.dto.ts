import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const createMoodLogSchema = z
  .object({
    date: zDateString,
    moodLabel: z.string().trim().min(1),
    moodIcon: z.string().trim().min(1).nullable().optional(),
    intensity: z.number().int().min(1).max(100),
    note: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export type CreateMoodLogInput = z.infer<typeof createMoodLogSchema>;

export class CreateMoodDto {
  date: Date;
  moodLabel: string;
  moodIcon?: string | null;
  intensity: number;
  note?: string | null;
}
