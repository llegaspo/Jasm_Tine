import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

const rangeSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}-\d{2}(\.\.|,)\d{4}-\d{2}-\d{2}$/,
    'Expected range as YYYY-MM-DD..YYYY-MM-DD',
  )
  .transform((value, context) => {
    const [fromValue, toValue] = value.includes('..')
      ? value.split('..')
      : value.split(',');
    const from = new Date(fromValue);
    const to = new Date(toValue);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      context.addIssue({
        code: 'custom',
        message: 'Expected range dates to be valid dates',
      });

      return z.NEVER;
    }

    return { from, to };
  });

export const journalQuerySchema = z
  .object({
    range: rangeSchema.optional(),
    from: zDateString.optional(),
    to: zDateString.optional(),
    date: zDateString.optional(),
    mood: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const from = value.from ?? value.range?.from;
    const to = value.to ?? value.range?.to;

    if (from && to && from > to) {
      context.addIssue({
        code: 'custom',
        message: 'from must be before or equal to to',
        path: value.from ? ['from'] : ['range'],
      });
    }
  });

export type JournalQueryDto = z.infer<typeof journalQuerySchema>;
