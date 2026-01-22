import { Injectable } from '@nestjs/common';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { UpdateStickyNoteDto } from './dto/update-sticky-note.dto';

@Injectable()
export class StickyNotesService {
  create(createStickyNoteDto: CreateStickyNoteDto) {
    return 'This action adds a new stickyNote';
  }

  findAll() {
    return `This action returns all stickyNotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stickyNote`;
  }

  update(id: number, updateStickyNoteDto: UpdateStickyNoteDto) {
    return `This action updates a #${id} stickyNote`;
  }

  remove(id: number) {
    return `This action removes a #${id} stickyNote`;
  }
}
