import { PartialType } from '@nestjs/mapped-types';
import { z } from 'zod';
import { CreateTaskDto, createTaskSchema } from './create-task.dto';

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one task field is required',
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
