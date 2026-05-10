import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { zDateString, zDecimal } from '../../common/validation/zod-schemas';

export const createMilestoneSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1).nullable().optional(),
    dueDate: zDateString,
    tone: z.string().trim().min(1).nullable().optional(),
    category: z.string().trim().min(1).nullable().optional(),
    completedAt: zDateString.nullable().optional(),
    sortOrder: zDecimal().optional(),
  })
  .strict();

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export class CreateMilestoneDto {
  name: string;
  description?: string | null;
  dueDate: Date;
  tone?: string | null;
  category?: string | null;
  completedAt?: Date | null;
  sortOrder?: Prisma.Decimal;
}
