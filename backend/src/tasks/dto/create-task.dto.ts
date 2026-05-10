import { z } from 'zod';
import { STATUS, Prisma } from '@prisma/client';
import { zDateString, zDecimal } from '../../common/validation/zod-schemas';

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    status: z.enum(STATUS).optional(),
    priority: z.number().int().optional(),
    category: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    sortOrder: zDecimal().optional(),
    dueDate: zDateString.optional(),
    scheduledDate: zDateString.optional(),
  })
  .strict();

export class CreateTaskDto {
  title: string;
  description?: string;
  status?: STATUS;
  priority?: number;
  category?: string;
  tags?: string[];
  sortOrder?: Prisma.Decimal;
  dueDate?: Date;
  scheduledDate?: Date;
}
