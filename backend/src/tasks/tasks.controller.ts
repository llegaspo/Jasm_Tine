import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import type { IdParam } from '../common/validation/zod-schemas';
import { idParamSchema } from '../common/validation/zod-schemas';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import { TasksService } from './tasks.service';
import { CreateTaskDto, createTaskSchema } from './dto/create-task.dto';
import type { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { reorderTasksSchema } from './dto/reorder-tasks.dto';
import type { TaskQueryDto } from './dto/task-query.dto';
import { taskQuerySchema } from './dto/task-query.dto';
import { UpdateTaskDto, updateTaskSchema } from './dto/update-task.dto';

const emptyBodySchema = z.object({}).strict().optional();
type EmptyBody = z.infer<typeof emptyBodySchema>;

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body(zodPipe(createTaskSchema)) createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(@Query(zodPipe(taskQuerySchema)) query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Patch('reorder')
  reorder(@Body(zodPipe(reorderTasksSchema)) reorderTasksDto: ReorderTasksDto) {
    return this.tasksService.reorder(reorderTasksDto);
  }

  @Patch(':id/complete')
  complete(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(emptyBodySchema)) _body?: EmptyBody,
  ) {
    return this.tasksService.complete(params.id);
  }

  @Patch(':id')
  update(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(updateTaskSchema)) updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(params.id, updateTaskDto);
  }

  @Delete(':id')
  remove(
    @Param(zodPipe(idParamSchema)) params: IdParam,
    @Body(zodPipe(emptyBodySchema)) _body?: EmptyBody,
  ) {
    return this.tasksService.remove(params.id);
  }
}
