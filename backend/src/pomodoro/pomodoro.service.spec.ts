import { Test, TestingModule } from '@nestjs/testing';
import { POMODORO_MODE, type PomodoroSession } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { PomodoroService } from './pomodoro.service';

describe('PomodoroService', () => {
  let service: PomodoroService;
  let prisma: {
    pomodoroSession: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  const currentUserId = 'cmockpomouser0000000000000';

  const createSession = (
    overrides: Partial<PomodoroSession> = {},
  ): PomodoroSession => ({
    id: 'cmockpomosession0000000001',
    userId: currentUserId,
    title: 'Write launch notes',
    mode: POMODORO_MODE.FOCUS,
    durationMinutes: 25,
    completed: true,
    atmosphere: 'Rain',
    startedAt: new Date('2026-05-11T01:00:00.000Z'),
    endedAt: new Date('2026-05-11T01:25:00.000Z'),
    completedAt: new Date('2026-05-11T01:25:00.000Z'),
    createdAt: new Date('2026-05-11T01:25:00.000Z'),
    updatedAt: new Date('2026-05-11T01:25:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-11T02:00:00.000Z'));

    prisma = {
      pomodoroSession: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Manila' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PomodoroService,
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

    service = module.get<PomodoroService>(PomodoroService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a completed session for the current user', async () => {
    const session = createSession();
    prisma.pomodoroSession.create.mockResolvedValue(session);

    await expect(
      service.createSession({
        taskTitle: session.title,
        mode: session.mode,
        duration: session.durationMinutes,
        completed: true,
        atmosphere: session.atmosphere,
        startedAt: session.startedAt ?? new Date(),
        endedAt: session.endedAt,
      }),
    ).resolves.toMatchObject({
      id: session.id,
      taskTitle: session.title,
      completed: true,
      skipped: false,
    });
    expect(prisma.pomodoroSession.create).toHaveBeenCalledWith({
      data: {
        userId: currentUserId,
        title: session.title,
        mode: session.mode,
        durationMinutes: session.durationMinutes,
        completed: true,
        atmosphere: session.atmosphere,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        completedAt: session.endedAt,
      },
    });
  });

  it('creates a skipped session as incomplete', async () => {
    const session = createSession({
      completed: false,
      completedAt: null,
      endedAt: null,
    });
    prisma.pomodoroSession.create.mockResolvedValue(session);

    await expect(
      service.createSession({
        taskTitle: session.title,
        mode: session.mode,
        duration: session.durationMinutes,
        completed: false,
        skipped: true,
        startedAt: session.startedAt ?? new Date(),
      }),
    ).resolves.toMatchObject({
      completed: false,
      skipped: true,
    });
    expect(prisma.pomodoroSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completed: false,
          completedAt: null,
        }),
      }),
    );
  });

  it('returns today sessions with summary totals', async () => {
    const focus = createSession();
    const skippedBreak = createSession({
      id: 'cmockpomosession0000000002',
      mode: POMODORO_MODE.SHORT_BREAK,
      durationMinutes: 5,
      completed: false,
      completedAt: null,
    });
    prisma.pomodoroSession.findMany.mockResolvedValue([focus, skippedBreak]);

    await expect(service.today()).resolves.toMatchObject({
      date: '2026-05-11',
      timezone: 'Asia/Manila',
      sessions: [{ id: focus.id }, { id: skippedBreak.id }],
      summary: {
        totalSessions: 2,
        completedSessions: 1,
        skippedSessions: 1,
        focusSessions: 1,
        focusMinutes: 25,
        completedFocusMinutes: 25,
        breakMinutes: 5,
      },
    });
    expect(prisma.pomodoroSession.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        startedAt: {
          gte: new Date('2026-05-10T16:00:00.000Z'),
          lt: new Date('2026-05-11T16:00:00.000Z'),
        },
      },
      orderBy: [{ startedAt: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('returns history for an explicit range', async () => {
    const session = createSession();
    prisma.pomodoroSession.findMany.mockResolvedValue([session]);

    await expect(
      service.history({
        startDate: new Date('2026-05-01T00:00:00.000Z'),
        endDate: new Date('2026-05-11T00:00:00.000Z'),
      }),
    ).resolves.toMatchObject({
      range: {
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-11T00:00:00.000Z',
      },
      sessions: [{ id: session.id }],
    });
    expect(prisma.pomodoroSession.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        startedAt: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lte: new Date('2026-05-11T00:00:00.000Z'),
        },
      },
      orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
    });
  });
});
