import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../current-user/current-user.service';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { UpdateStickyNoteDto } from './dto/update-sticky-note.dto';

@Injectable()
export class StickyNotesService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async create(createStickyNoteDto: CreateStickyNoteDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void createStickyNoteDto;
    return 'This action adds a new stickyNote';
  }

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns all stickyNotes`;
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns a #${id} stickyNote`;
  }

  async update(id: string, updateStickyNoteDto: UpdateStickyNoteDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void updateStickyNoteDto;
    return `This action updates a #${id} stickyNote`;
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action removes a #${id} stickyNote`;
  }
}
