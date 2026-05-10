import { PartialType } from '@nestjs/mapped-types';
import { z } from 'zod';
import {
  CreateMilestoneDto,
  createMilestoneSchema,
} from './create-milestone.dto';

export const updateMilestoneSchema = createMilestoneSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one milestone field is required',
  });

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}
