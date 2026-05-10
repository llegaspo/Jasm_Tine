import { Test, TestingModule } from '@nestjs/testing';
import {
  Prisma,
  REMINDER_CADENCE,
  type Reminder,
  type ReminderLog,
} from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: {
    reminder: {
      findMany: jest.Mock;
    };
    reminderLog: {
      upsert: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  const currentUserId = 'cmockreminderuser000000000';

  const createReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
    id: 'cmockreminder0000000000001',
    userId: currentUserId,
    title: 'Drink Water',
    description: 'Stay hydrated.',
    icon: 'water_drop',
    actionLabel: '250ml',
    actionIcon: 'add',
    tone: 'primary',
    cadence: REMINDER_CADENCE.DAILY,
    isActive: true,
    sortOrder: new Prisma.Decimal(1),
    createdAt: new Date('2026-05-11T01:00:00.000Z'),
    updatedAt: new Date('2026-05-11T01:00:00.000Z'),
    ...overrides,
  });

  const createLog = (overrides: Partial<ReminderLog> = {}): ReminderLog => ({
    id: 'cmockreminderlog0000000001',
    userId: currentUserId,
    reminderId: 'cmockreminder0000000000001',
    date: new Date('2026-05-11T00:00:00.000Z'),
    amount: 250,
    unit: 'ml',
    completedAt: new Date('2026-05-11T02:00:00.000Z'),
    createdAt: new Date('2026-05-11T02:00:00.000Z'),
    updatedAt: new Date('2026-05-11T02:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-11T02:00:00.000Z'));

    prisma = {
      reminder: {
        findMany: jest.fn(),
      },
      reminderLog: {
        upsert: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Manila' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
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

    service = module.get<RemindersService>(RemindersService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists current user reminders', async () => {
    const reminder = createReminder();
    prisma.reminder.findMany.mockResolvedValue([reminder]);

    await expect(service.findAll()).resolves.toEqual([
      expect.objectContaining({
        id: reminder.id,
        key: 'drinkwater',
        title: reminder.title,
        sortOrder: 1,
      }),
    ]);
    expect(prisma.reminder.findMany).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('returns today reminders with completion status', async () => {
    const reminder = createReminder();
    prisma.reminder.findMany.mockResolvedValue([
      {
        ...reminder,
        logs: [createLog()],
      },
    ]);

    await expect(service.today()).resolves.toMatchObject({
      date: '2026-05-11',
      timezone: 'Asia/Manila',
      reminders: [
        {
          id: reminder.id,
          completed: true,
          log: {
            amount: 250,
            unit: 'ml',
          },
        },
      ],
      summary: {
        total: 1,
        completed: 1,
        pending: 0,
      },
    });
    expect(prisma.reminder.findMany).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      include: {
        logs: {
          where: { date: new Date('2026-05-11T00:00:00.000Z') },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('logs reminder completion for today by key', async () => {
    const reminder = createReminder();
    const log = createLog();
    prisma.reminder.findMany.mockResolvedValue([reminder]);
    prisma.reminderLog.upsert.mockResolvedValue(log);

    await expect(
      service.log('water', { amount: 250, unit: 'ml' }),
    ).resolves.toMatchObject({
      reminder: {
        id: reminder.id,
      },
      log: {
        id: log.id,
        amount: 250,
      },
    });
    expect(prisma.reminderLog.upsert).toHaveBeenCalledWith({
      where: {
        reminderId_date: {
          reminderId: reminder.id,
          date: new Date('2026-05-11T00:00:00.000Z'),
        },
      },
      update: {
        amount: 250,
        unit: 'ml',
        completedAt: expect.any(Date),
      },
      create: {
        userId: currentUserId,
        reminderId: reminder.id,
        date: new Date('2026-05-11T00:00:00.000Z'),
        amount: 250,
        unit: 'ml',
        completedAt: expect.any(Date),
      },
    });
  });

  it('rejects missing reminder keys', async () => {
    prisma.reminder.findMany.mockResolvedValue([]);

    await expect(service.log('water', {})).rejects.toThrow(
      'Reminder water was not found',
    );
    expect(prisma.reminderLog.upsert).not.toHaveBeenCalled();
  });
});
