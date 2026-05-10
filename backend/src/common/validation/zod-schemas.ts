import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const zCuid = z
  .string()
  .regex(/^c[a-z0-9]{24}$/, 'Expected a valid CUID');

export const idParamSchema = z.object({
  id: zCuid,
});

export const zDateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Expected a valid date string',
  })
  .transform((value) => new Date(value));

export const zOptionalDateString = zDateString.optional();

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const rangeQuerySchema = z
  .object({
    from: zOptionalDateString,
    to: zOptionalDateString,
  })
  .strict()
  .refine(
    ({ from, to }) => {
      if (!from || !to) {
        return true;
      }

      return from <= to;
    },
    {
      message: 'from must be before or equal to to',
      path: ['from'],
    },
  );

export const zDecimal = () =>
  z
    .union([z.string(), z.number(), z.instanceof(Prisma.Decimal)])
    .refine(
      (value) => {
        try {
          new Prisma.Decimal(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid decimal format' },
    )
    .transform((value) => new Prisma.Decimal(value));

export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type RangeQuery = z.infer<typeof rangeQuerySchema>;
