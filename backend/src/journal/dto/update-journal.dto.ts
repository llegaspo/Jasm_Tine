import { PartialType } from '@nestjs/mapped-types';
import { z } from 'zod';
import { CreateJournalDto, createJournalSchema } from './create-journal.dto';

export const updateJournalSchema = createJournalSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one journal field is required',
  });

export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;

export class UpdateJournalDto extends PartialType(CreateJournalDto) {}
