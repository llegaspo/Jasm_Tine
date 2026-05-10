import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../current-user/current-user.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';

@Injectable()
export class MoodService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async create(createMoodDto: CreateMoodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void createMoodDto;
    return 'This action adds a new mood';
  }

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns all mood`;
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns a #${id} mood`;
  }

  async update(id: string, updateMoodDto: UpdateMoodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void updateMoodDto;
    return `This action updates a #${id} mood`;
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action removes a #${id} mood`;
  }
}
