import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, STATUS, type Task } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    $transaction: jest.Mock;
    daySummary: {
      upsert: jest.Mock;
    };
    task: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  const currentUserId = 'cmocktaskuser0000000000000';

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'cmocktask000000000000000001',
    userId: currentUserId,
    title: 'Review launch checklist',
    description: null,
    status: STATUS.TODO,
    completedAt: null,
    priority: 1,
    category: 'Launch',
    tags: [],
    sortOrder: new Prisma.Decimal(1),
    dueDate: null,
    scheduledDate: new Date('2026-05-10T00:00:00.000Z'),
    createdAt: new Date('2026-05-10T01:00:00.000Z'),
    updatedAt: new Date('2026-05-10T01:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback) => callback(prisma)),
      daySummary: {
        upsert: jest.fn(),
      },
      task: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue(currentUserId),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task for the current user only', async () => {
    const task = createTask();
    prisma.task.create.mockResolvedValue(task);

    await expect(service.create({ title: task.title })).resolves.toMatchObject({
      id: task.id,
      title: task.title,
      completed: false,
      sortOrder: 1,
    });
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: task.title,
        completedAt: undefined,
        userId: currentUserId,
      },
    });
  });

  it('lists tasks scoped to the current user with filters', async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await service.findAll({
      completed: false,
      priority: 2,
      category: 'Design',
      date: new Date('2026-05-10T00:00:00.000Z'),
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        priority: 2,
        category: 'Design',
        scheduledDate: new Date('2026-05-10T00:00:00.000Z'),
        AND: [
          {
            status: { not: STATUS.DONE },
            completedAt: null,
          },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('rejects updates for tasks outside the current user scope', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(
      service.update('cmissingtask000000000000000', { title: 'New title' }),
    ).rejects.toThrow('Task cmissingtask000000000000000 was not found');
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('reorders multiple owned tasks in a transaction', async () => {
    const firstTask = createTask({ id: 'cmocktask000000000000000001' });
    const secondTask = createTask({
      id: 'cmocktask000000000000000002',
      sortOrder: new Prisma.Decimal(2),
    });
    prisma.task.findMany
      .mockResolvedValueOnce([{ id: firstTask.id }, { id: secondTask.id }])
      .mockResolvedValueOnce([secondTask, firstTask]);
    prisma.task.update.mockResolvedValue(firstTask);

    const result = await service.reorder([
      { id: firstTask.id, sortOrder: new Prisma.Decimal(2) },
      { id: secondTask.id, sortOrder: new Prisma.Decimal(1) },
    ]);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.task.update).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('marks an incomplete task complete and updates the day summary', async () => {
    const incompleteTask = createTask();
    const completedTask = createTask({
      status: STATUS.DONE,
      completedAt: new Date('2026-05-10T02:00:00.000Z'),
    });
    prisma.task.findFirst.mockResolvedValue(incompleteTask);
    prisma.task.update.mockResolvedValue(completedTask);

    await expect(service.complete(incompleteTask.id)).resolves.toMatchObject({
      id: incompleteTask.id,
      completed: true,
      completedAt: '2026-05-10T02:00:00.000Z',
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: incompleteTask.id },
      data: {
        status: STATUS.DONE,
        completedAt: expect.any(Date),
      },
    });
    expect(prisma.daySummary.upsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: currentUserId,
          date: incompleteTask.scheduledDate,
        },
      },
      update: {
        completedTask: { increment: 1 },
      },
      create: {
        userId: currentUserId,
        date: incompleteTask.scheduledDate,
        totalTasks: 1,
        completedTask: 1,
      },
    });
  });
});
