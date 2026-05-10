import { z } from 'zod';
import { STATUS, Prisma } from '@prisma/client';
import { zDate, zDecimal } from '../../common/zDecimal';

export const createTaskSchema = z.object({
  title: z.string(),
  status: z.enum(STATUS),
  priority_level: z.int(),
  sort_order: zDecimal(),
  due_date: zDate.optional(),
  scheduled_date: zDate.optional(),
});

export class CreateTaskDto {
  title: string;
  status: STATUS;
  priority_level: number;
  sort_order: Prisma.Decimal;
  due_date?: Date;
  scheduled_date?: Date;
}
