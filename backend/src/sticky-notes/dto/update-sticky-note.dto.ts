import { PartialType } from '@nestjs/mapped-types';
import { CreateStickyNoteDto } from './create-sticky-note.dto';

export class UpdateStickyNoteDto extends PartialType(CreateStickyNoteDto) {}
