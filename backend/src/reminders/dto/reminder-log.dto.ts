import { z } from 'zod';

export const reminderKeyParamSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'Expected a reminder key'),
  })
  .strict();

export const reminderLogSchema = z
  .object({
    amount: z.number().int().positive().optional(),
    unit: z.string().trim().min(1).optional(),
  })
  .strict()
  .optional();

export type ReminderKeyParam = z.infer<typeof reminderKeyParamSchema>;
export type ReminderLogDto = z.infer<typeof reminderLogSchema>;
