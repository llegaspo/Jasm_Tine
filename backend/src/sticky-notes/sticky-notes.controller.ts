import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StickyNotesService } from './sticky-notes.service';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { UpdateStickyNoteDto } from './dto/update-sticky-note.dto';

@Controller('sticky-notes')
export class StickyNotesController {
  constructor(private readonly stickyNotesService: StickyNotesService) {}

  @Post()
  create(@Body() createStickyNoteDto: CreateStickyNoteDto) {
    return this.stickyNotesService.create(createStickyNoteDto);
  }

  @Get()
  findAll() {
    return this.stickyNotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stickyNotesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStickyNoteDto: UpdateStickyNoteDto) {
    return this.stickyNotesService.update(+id, updateStickyNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stickyNotesService.remove(+id);
  }
}
