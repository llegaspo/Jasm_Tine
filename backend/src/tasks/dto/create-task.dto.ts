import { z } from 'zod';
import { STATUS } from '../../../generated/prisma/client';

export const createTaskSchema = z.object({
  title: z.string(),
  status: z.enum(STATUS),
  priority_level: z.int(),
  sorder_order: z.decimal(),
  due_date: z.Date(),
});

export class CreateTaskDto {}
