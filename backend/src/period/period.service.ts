import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../current-user/current-user.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Injectable()
export class PeriodService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async create(createPeriodDto: CreatePeriodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void createPeriodDto;
    return 'This action adds a new period';
  }

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns all period`;
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns a #${id} period`;
  }

  async update(id: string, updatePeriodDto: UpdatePeriodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void updatePeriodDto;
    return `This action updates a #${id} period`;
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action removes a #${id} period`;
  }
}
