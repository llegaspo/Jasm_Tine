import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    daySummary: {
      findUnique: jest.Mock;
    };
    milestone: {
      findMany: jest.Mock;
    };
    reminder: {
      findMany: jest.Mock;
    };
    reminderLog: {
      findMany: jest.Mock;
    };
    stickyNote: {
      findMany: jest.Mock;
    };
    task: {
      findMany: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  const currentUserId = 'cmockdashuser0000000000000';

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-10T02:00:00.000Z'));

    prisma = {
      daySummary: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      milestone: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      reminder: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      reminderLog: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      stickyNote: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      task: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: currentUserId,
          firstName: 'Jasmine',
          lastName: 'Tine',
          email: 'jasmine@example.com',
          timezone: 'Asia/Manila',
          profile: {
            displayName: 'Jasmine',
            bio: null,
            avatarUrl: null,
            currentFocus: 'Launch planning',
          },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a stable empty dashboard payload scoped to the current user', async () => {
    const result = await service.getToday();
    const today = new Date('2026-05-10T00:00:00.000Z');

    expect(result).toMatchObject({
      profile: {
        id: currentUserId,
        firstName: 'Jasmine',
        lastName: 'Tine',
        displayName: 'Jasmine',
        email: 'jasmine@example.com',
        currentFocus: 'Launch planning',
        greetingName: 'Jasmine',
      },
      today: {
        date: '2026-05-10',
        timezone: 'Asia/Manila',
        startsAt: '2026-05-09T16:00:00.000Z',
        endsAt: '2026-05-10T16:00:00.000Z',
      },
      priorityTasks: [],
      unfinishedTasksToday: [],
      finishedTasksToday: [],
      activeReminders: [],
      reminderStatus: {
        date: '2026-05-10',
        total: 0,
        completed: 0,
        pending: 0,
        logs: [],
      },
      upcomingMilestones: [],
      stickyNotes: [],
      daySummary: null,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: currentUserId },
      select: expect.any(Object),
    });
    expect(prisma.task.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({ userId: currentUserId }),
      }),
    );
    expect(prisma.task.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          userId: currentUserId,
          scheduledDate: today,
        }),
      }),
    );
    expect(prisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: currentUserId,
          isActive: true,
        },
      }),
    );
    expect(prisma.daySummary.findUnique).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: currentUserId,
          date: today,
        },
      },
    });
  });

  it('assembles reminders, milestones, notes, tasks, and day summary', async () => {
    prisma.task.findMany
      .mockResolvedValueOnce([
        {
          id: 'ctaskpriority000000000000001',
          userId: currentUserId,
          title: 'Priority task',
          description: null,
          status: 'TODO',
          completedAt: null,
          priority: 1,
          category: 'Launch',
          tags: ['Urgent'],
          sortOrder: new Prisma.Decimal(1),
          dueDate: null,
          scheduledDate: new Date('2026-05-10T00:00:00.000Z'),
          createdAt: new Date('2026-05-10T01:00:00.000Z'),
          updatedAt: new Date('2026-05-10T01:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.reminder.findMany.mockResolvedValue([
      {
        id: 'creminder0000000000000001',
        userId: currentUserId,
        title: 'Drink Water',
        description: 'Stay hydrated.',
        icon: 'water_drop',
        actionLabel: '250ml',
        actionIcon: 'add',
        tone: 'primary',
        cadence: 'DAILY',
        isActive: true,
        sortOrder: new Prisma.Decimal(1),
        createdAt: new Date('2026-05-10T01:00:00.000Z'),
        updatedAt: new Date('2026-05-10T01:00:00.000Z'),
      },
    ]);
    prisma.reminderLog.findMany.mockResolvedValue([
      {
        id: 'creminderlog00000000000001',
        userId: currentUserId,
        reminderId: 'creminder0000000000000001',
        date: new Date('2026-05-10T00:00:00.000Z'),
        amount: 250,
        unit: 'ml',
        completedAt: new Date('2026-05-10T03:00:00.000Z'),
        createdAt: new Date('2026-05-10T03:00:00.000Z'),
        updatedAt: new Date('2026-05-10T03:00:00.000Z'),
      },
    ]);
    prisma.milestone.findMany.mockResolvedValue([
      {
        id: 'cmilestone000000000000001',
        userId: currentUserId,
        name: 'Website Launch',
        description: null,
        dueDate: new Date('2026-05-14T00:00:00.000Z'),
        tone: 'primary',
        category: 'Launch',
        completedAt: null,
        sortOrder: new Prisma.Decimal(1),
        createdAt: new Date('2026-05-10T01:00:00.000Z'),
        updatedAt: new Date('2026-05-10T01:00:00.000Z'),
      },
    ]);
    prisma.stickyNote.findMany.mockResolvedValue([
      {
        id: 'cnote00000000000000000001',
        userId: currentUserId,
        text: 'Order tea',
        tone: 'primary',
        color: null,
        sortOrder: new Prisma.Decimal(1),
        createdAt: new Date('2026-05-10T01:00:00.000Z'),
        updatedAt: new Date('2026-05-10T01:00:00.000Z'),
      },
    ]);
    prisma.daySummary.findUnique.mockResolvedValue({
      userId: currentUserId,
      date: new Date('2026-05-10T00:00:00.000Z'),
      totalTasks: 3,
      completedTask: 1,
    });

    const result = await service.getToday();

    expect(result.priorityTasks).toHaveLength(1);
    expect(result.activeReminders).toMatchObject([
      {
        id: 'creminder0000000000000001',
        completed: true,
        log: {
          amount: 250,
          completedAt: '2026-05-10T03:00:00.000Z',
        },
      },
    ]);
    expect(result.reminderStatus).toMatchObject({
      total: 1,
      completed: 1,
      pending: 0,
    });
    expect(result.upcomingMilestones).toMatchObject([
      {
        id: 'cmilestone000000000000001',
        daysLeft: 4,
      },
    ]);
    expect(result.stickyNotes).toMatchObject([{ text: 'Order tea' }]);
    expect(result.daySummary).toEqual({
      date: '2026-05-10T00:00:00.000Z',
      totalTasks: 3,
      completedTask: 1,
    });
  });
});
