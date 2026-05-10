import { z } from 'zod';
import { zDateString } from '../../common/validation/zod-schemas';

export const createJournalSchema = z
  .object({
    date: zDateString,
    title: z.string().trim().min(1),
    content: z.string().trim().min(1),
    excerpt: z.string().trim().min(1).nullable().optional(),
    mood: z.string().trim().min(1).nullable().optional(),
    moodIcon: z.string().trim().min(1).nullable().optional(),
    imageUrl: z.string().trim().min(1).nullable().optional(),
    featured: z.boolean().optional(),
  })
  .strict();

export type CreateJournalInput = z.infer<typeof createJournalSchema>;

export class CreateJournalDto {
  date: Date;
  title: string;
  content: string;
  excerpt?: string | null;
  mood?: string | null;
  moodIcon?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
}
