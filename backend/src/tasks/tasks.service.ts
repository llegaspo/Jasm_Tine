import { Injectable, NotFoundException } from '@nestjs/common';
import { STATUS, type Prisma, type Task } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const completedAt =
      createTaskDto.status === STATUS.DONE ? new Date() : undefined;

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        completedAt,
        userId: currentUserId,
      },
    });

    return this.toTaskResponse(task);
  }

  async findAll(query: TaskQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const where = this.buildTaskWhere(currentUserId, query);
    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return tasks.map((task) => this.toTaskResponse(task));
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const existingTask = await this.findOwnedTask(id, currentUserId);
    const completedAt =
      updateTaskDto.status === STATUS.DONE
        ? (existingTask.completedAt ?? new Date())
        : updateTaskDto.status
          ? null
          : undefined;

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        completedAt,
      },
    });

    return this.toTaskResponse(task);
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const result = await this.prisma.task.deleteMany({
      where: { id, userId: currentUserId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    return { id, deleted: true };
  }

  async reorder(reorderTasksDto: ReorderTasksDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const taskIds = reorderTasksDto.map((item) => item.id);

    const tasks = await this.prisma.$transaction(async (tx) => {
      const ownedTasks = await tx.task.findMany({
        where: {
          id: { in: taskIds },
          userId: currentUserId,
        },
        select: { id: true },
      });

      if (ownedTasks.length !== taskIds.length) {
        throw new NotFoundException('One or more tasks were not found');
      }

      await Promise.all(
        reorderTasksDto.map((item) =>
          tx.task.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          }),
        ),
      );

      return tx.task.findMany({
        where: {
          id: { in: taskIds },
          userId: currentUserId,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    });

    return tasks.map((task) => this.toTaskResponse(task));
  }

  async complete(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    const task = await this.prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findFirst({
        where: { id, userId: currentUserId },
      });

      if (!existingTask) {
        throw new NotFoundException(`Task ${id} was not found`);
      }

      const wasCompleted = this.isCompleted(existingTask);
      const completedAt = existingTask.completedAt ?? new Date();
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: STATUS.DONE,
          completedAt,
        },
      });

      if (!wasCompleted) {
        await this.updateDaySummary(tx, currentUserId, updatedTask);
      }

      return updatedTask;
    });

    return this.toTaskResponse(task);
  }

  private buildTaskWhere(
    currentUserId: string,
    query: TaskQueryDto,
  ): Prisma.TaskWhereInput {
    const filters: Prisma.TaskWhereInput[] = [];

    if (query.completed === true) {
      filters.push({
        OR: [{ status: STATUS.DONE }, { completedAt: { not: null } }],
      });
    }

    if (query.completed === false) {
      filters.push({
        status: { not: STATUS.DONE },
        completedAt: null,
      });
    }

    return {
      userId: currentUserId,
      ...(query.priority !== undefined ? { priority: query.priority } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.date !== undefined ? { scheduledDate: query.date } : {}),
      ...(filters.length > 0 ? { AND: filters } : {}),
    };
  }

  private async findOwnedTask(
    id: string,
    currentUserId: string,
  ): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId: currentUserId },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    return task;
  }

  private async updateDaySummary(
    tx: Prisma.TransactionClient,
    currentUserId: string,
    task: Task,
  ): Promise<void> {
    const summaryDate =
      task.scheduledDate ?? this.startOfUtcDate(task.completedAt ?? new Date());

    await tx.daySummary.upsert({
      where: {
        userId_date: {
          userId: currentUserId,
          date: summaryDate,
        },
      },
      update: {
        completedTask: { increment: 1 },
      },
      create: {
        userId: currentUserId,
        date: summaryDate,
        totalTasks: 1,
        completedTask: 1,
      },
    });
  }

  private startOfUtcDate(date: Date): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  private isCompleted(task: Task): boolean {
    return task.status === STATUS.DONE || task.completedAt !== null;
  }

  private toTaskResponse(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      completed: this.isCompleted(task),
      completedAt: task.completedAt?.toISOString() ?? null,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      sortOrder: task.sortOrder.toNumber(),
      dueDate: task.dueDate?.toISOString() ?? null,
      scheduledDate: task.scheduledDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
