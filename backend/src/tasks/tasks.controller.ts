import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
} from '@nestjs/common';
import type { IdParam } from '../common/validation/zod-schemas';
import { idParamSchema } from '../common/validation/zod-schemas';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, updateTaskSchema } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(updateTaskSchema)) updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(params.id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
