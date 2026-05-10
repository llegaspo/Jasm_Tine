import { z } from 'zod';

const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (timezone) => {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Expected a valid IANA timezone',
    },
  );

const nullableTrimmedString = z.string().trim().min(1).nullable().optional();

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    bio: nullableTrimmedString,
    avatarUrl: nullableTrimmedString,
    timezone: timezoneSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one profile field is required',
  });

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
