import { z } from 'zod';
import { Prisma } from '../../generated/prisma/client';

export const zDecimal = () =>
  // 2. Use 'Prisma.Decimal' here
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

export const zId = z.string().regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');
export const zDate = z.coerce.date();
export const zPositiveNumber = z.number().positive('Must be a positive number');
