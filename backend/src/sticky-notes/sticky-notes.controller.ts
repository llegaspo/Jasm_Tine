import { Body, Controller, Get, Put } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import { StickyNotesService } from './sticky-notes.service';
import type { BulkStickyNotesDto } from './dto/create-sticky-note.dto';
import { bulkStickyNotesSchema } from './dto/create-sticky-note.dto';

@Controller('sticky-notes')
export class StickyNotesController {
  constructor(private readonly stickyNotesService: StickyNotesService) {}

  @Get()
  findAll() {
    return this.stickyNotesService.findAll();
  }

  @Put('bulk')
  bulkSave(@Body(zodPipe(bulkStickyNotesSchema)) body: BulkStickyNotesDto) {
    return this.stickyNotesService.bulkSave(body);
  }
}
