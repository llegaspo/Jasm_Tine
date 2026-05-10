import { Test, TestingModule } from '@nestjs/testing';
import { type MoodLog } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { MoodService } from './mood.service';

describe('MoodService', () => {
  let service: MoodService;
  let prisma: {
    moodLog: {
      findMany: jest.Mock;
      upsert: jest.Mock;
    };
  };

  const currentUserId = 'cmockmooduser0000000000000';

  const createMoodLog = (overrides: Partial<MoodLog> = {}): MoodLog => ({
    id: 'cmockmoodlog0000000000001',
    userId: currentUserId,
    date: new Date('2026-05-10T00:00:00.000Z'),
    moodLabel: 'Calm',
    moodIcon: 'spa',
    intensity: 80,
    note: null,
    createdAt: new Date('2026-05-10T01:00:00.000Z'),
    updatedAt: new Date('2026-05-10T01:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-10T12:00:00.000Z'));

    prisma = {
      moodLog: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodService,
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

    service = module.get<MoodService>(MoodService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates or updates a mood log for a date', async () => {
    const moodLog = createMoodLog();
    prisma.moodLog.upsert.mockResolvedValue(moodLog);

    await expect(
      service.save({
        date: moodLog.date,
        moodLabel: moodLog.moodLabel,
        moodIcon: moodLog.moodIcon,
        intensity: moodLog.intensity,
      }),
    ).resolves.toMatchObject({
      id: moodLog.id,
      moodLabel: moodLog.moodLabel,
      intensity: moodLog.intensity,
    });
    expect(prisma.moodLog.upsert).toHaveBeenCalledWith({
      where: {
        userId_date: {
          userId: currentUserId,
          date: moodLog.date,
        },
      },
      update: {
        moodLabel: moodLog.moodLabel,
        moodIcon: moodLog.moodIcon,
        intensity: moodLog.intensity,
        note: undefined,
      },
      create: {
        userId: currentUserId,
        date: moodLog.date,
        moodLabel: moodLog.moodLabel,
        moodIcon: moodLog.moodIcon,
        intensity: moodLog.intensity,
        note: undefined,
      },
    });
  });

  it('returns mood logs for an explicit date range', async () => {
    prisma.moodLog.findMany.mockResolvedValue([]);

    await service.findAll({
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-05-10T00:00:00.000Z'),
    });

    expect(prisma.moodLog.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        date: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lte: new Date('2026-05-10T00:00:00.000Z'),
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('returns weekly mood logs', async () => {
    prisma.moodLog.findMany.mockResolvedValue([]);

    await service.findAll({ range: 'week' });

    expect(prisma.moodLog.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        date: {
          gte: new Date('2026-05-04T00:00:00.000Z'),
          lte: new Date('2026-05-10T00:00:00.000Z'),
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('returns safe empty summary data', async () => {
    prisma.moodLog.findMany.mockResolvedValue([]);

    await expect(service.summary({ range: 'week' })).resolves.toEqual({
      count: 0,
      averageIntensity: null,
      mostFrequentMood: null,
      latest: null,
      byMood: [],
      logs: [],
    });
  });

  it('returns weekly mood summary data', async () => {
    prisma.moodLog.findMany.mockResolvedValue([
      createMoodLog({ moodLabel: 'Calm', intensity: 80 }),
      createMoodLog({
        id: 'cmockmoodlog0000000000002',
        moodLabel: 'Focused',
        intensity: 60,
      }),
      createMoodLog({
        id: 'cmockmoodlog0000000000003',
        moodLabel: 'Calm',
        intensity: 70,
      }),
    ]);

    await expect(service.summary({ range: 'week' })).resolves.toMatchObject({
      count: 3,
      averageIntensity: 70,
      mostFrequentMood: 'Calm',
      byMood: [
        { moodLabel: 'Calm', count: 2 },
        { moodLabel: 'Focused', count: 1 },
      ],
    });
  });
});
