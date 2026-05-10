import { z } from 'zod';

export const notificationKeyParamSchema = z
  .object({
    key: z.string().trim().min(1),
  })
  .strict();

export const updateNotificationPreferenceSchema = z
  .object({
    enabled: z.boolean(),
  })
  .strict();

export type NotificationKeyParam = z.infer<typeof notificationKeyParamSchema>;
export type UpdateNotificationPreferenceDto = z.infer<
  typeof updateNotificationPreferenceSchema
>;
