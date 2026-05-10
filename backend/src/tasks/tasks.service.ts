import { Injectable } from '@nestjs/common';
import { CurrentUserService } from '../current-user/current-user.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly currentUserService: CurrentUserService) {}

  async create(createTaskDto: CreateTaskDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void createTaskDto;
    return 'This action adds a new task';
  }

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns all tasks`;
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action returns a #${id} task`;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    void updateTaskDto;
    return `This action updates a #${id} task`;
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    void currentUserId;
    return `This action removes a #${id} task`;
  }
}
