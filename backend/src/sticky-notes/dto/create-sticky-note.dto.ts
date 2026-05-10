import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { zCuid, zDecimal } from '../../common/validation/zod-schemas';

const stickyNoteInputSchema = z
  .object({
    id: zCuid.optional(),
    text: z.string().trim().min(1),
    tone: z.string().trim().min(1).nullable().optional(),
    color: z.string().trim().min(1).nullable().optional(),
    sortOrder: zDecimal().optional(),
  })
  .strict();

export const bulkStickyNotesSchema = z
  .object({
    notes: z.array(stickyNoteInputSchema),
  })
  .strict()
  .refine(
    ({ notes }) => {
      const ids = notes.flatMap((note) => (note.id ? [note.id] : []));

      return new Set(ids).size === ids.length;
    },
    {
      message: 'Sticky note IDs must be unique',
      path: ['notes'],
    },
  );

export type BulkStickyNotesDto = z.infer<typeof bulkStickyNotesSchema>;

export class CreateStickyNoteDto {
  id?: string;
  text: string;
  tone?: string | null;
  color?: string | null;
  sortOrder?: Prisma.Decimal;
}
