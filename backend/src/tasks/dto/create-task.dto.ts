import { z } from 'zod';
import { STATUS, Prisma } from '@prisma/client';
import { zDate, zDecimal } from '../../common/zDecimal';

export const createTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(STATUS).optional(),
  priority: z.int().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: zDecimal().optional(),
  dueDate: zDate.optional(),
  scheduledDate: zDate.optional(),
});

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
