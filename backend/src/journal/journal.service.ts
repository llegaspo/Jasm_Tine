import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../current-user/current-user.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async create(createJournalDto: CreateJournalDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void createJournalDto;
    return 'This action adds a new journal';
  }

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns all journal`;
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns a #${id} journal`;
  }

  async update(id: string, updateJournalDto: UpdateJournalDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void updateJournalDto;
    return `This action updates a #${id} journal`;
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action removes a #${id} journal`;
  }
}
