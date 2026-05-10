import { POMODORO_MODE } from '@prisma/client';
import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const createPomodoroSessionSchema = z
  .object({
    taskTitle: z.string().trim().min(1).optional(),
    mode: z.enum(POMODORO_MODE),
    duration: z.number().int().min(1).max(240),
    completed: z.boolean(),
    skipped: z.boolean().optional(),
    atmosphere: z.string().trim().min(1).nullable().optional(),
    startedAt: zDateString,
    endedAt: zDateString.nullable().optional(),
  })
  .strict()
  .refine(({ completed, skipped }) => !(completed && skipped), {
    message: 'completed and skipped cannot both be true',
    path: ['skipped'],
  });

export type CreatePomodoroSessionInput = z.infer<
  typeof createPomodoroSessionSchema
>;

export class CreatePomodoroSessionDto {
  taskTitle?: string;
  mode: POMODORO_MODE;
  duration: number;
  completed: boolean;
  skipped?: boolean;
  atmosphere?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
}
