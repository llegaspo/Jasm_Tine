import { Test, TestingModule } from '@nestjs/testing';
import { type CycleEntry, type SymptomLog } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodService } from './period.service';

describe('PeriodService', () => {
  let service: PeriodService;
  let prisma: {
    cycleEntry: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    symptomLog: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const currentUserId = 'cmockcycleuser00000000000';

  const createCycleEntry = (
    overrides: Partial<CycleEntry> = {},
  ): CycleEntry => ({
    id: 'cmockcycleentry00000000001',
    userId: currentUserId,
    startDate: new Date('2026-05-01T00:00:00.000Z'),
    endDate: null,
    cycleDay: null,
    phase: null,
    flow: 'medium',
    note: null,
    createdAt: new Date('2026-05-01T01:00:00.000Z'),
    updatedAt: new Date('2026-05-01T01:00:00.000Z'),
    ...overrides,
  });

  const createSymptomLog = (
    overrides: Partial<SymptomLog> = {},
  ): SymptomLog => ({
    id: 'cmocksymptomlog0000000001',
    userId: currentUserId,
    cycleEntryId: null,
    date: new Date('2026-05-10T00:00:00.000Z'),
    symptom: 'Cramps',
    severity: 3,
    note: null,
    createdAt: new Date('2026-05-10T01:00:00.000Z'),
    updatedAt: new Date('2026-05-10T01:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-10T12:00:00.000Z'));

    prisma = {
      cycleEntry: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      symptomLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodService,
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

    service = module.get<PeriodService>(PeriodService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('saves cycle entry data for the current user', async () => {
    const cycleEntry = createCycleEntry();
    prisma.cycleEntry.create.mockResolvedValue(cycleEntry);

    await expect(
      service.saveEntry({
        startDate: cycleEntry.startDate,
        flow: cycleEntry.flow,
      }),
    ).resolves.toMatchObject({
      id: cycleEntry.id,
      flow: cycleEntry.flow,
    });
    expect(prisma.cycleEntry.create).toHaveBeenCalledWith({
      data: {
        userId: currentUserId,
        startDate: cycleEntry.startDate,
        endDate: undefined,
        cycleDay: undefined,
        phase: undefined,
        flow: cycleEntry.flow,
        note: undefined,
      },
    });
  });

  it('returns safe empty cycle summary data', async () => {
    prisma.cycleEntry.findFirst.mockResolvedValue(null);
    prisma.cycleEntry.findMany.mockResolvedValue([]);

    await expect(service.summary()).resolves.toEqual({
      current: null,
      predictedPhase: null,
      recentEntries: [],
    });
  });

  it('returns current cycle summary with simple phase prediction', async () => {
    const cycleEntry = createCycleEntry();
    prisma.cycleEntry.findFirst.mockResolvedValue(cycleEntry);
    prisma.cycleEntry.findMany.mockResolvedValue([cycleEntry]);

    await expect(service.summary()).resolves.toMatchObject({
      current: {
        id: cycleEntry.id,
        cycleDay: 10,
      },
      predictedPhase: 'Follicular',
      recentEntries: [{ id: cycleEntry.id }],
    });
  });

  it('logs symptoms and links an owned cycle entry when provided', async () => {
    const symptomLog = createSymptomLog({
      cycleEntryId: 'cmockcycleentry00000000001',
    });
    prisma.cycleEntry.findFirst.mockResolvedValue({
      id: symptomLog.cycleEntryId,
    });
    prisma.symptomLog.create.mockResolvedValue(symptomLog);

    await expect(
      service.saveSymptom({
        date: symptomLog.date,
        symptom: symptomLog.symptom,
        severity: symptomLog.severity,
        cycleEntryId: symptomLog.cycleEntryId ?? undefined,
      }),
    ).resolves.toMatchObject({
      id: symptomLog.id,
      cycleEntryId: symptomLog.cycleEntryId,
    });
    expect(prisma.symptomLog.create).toHaveBeenCalledWith({
      data: {
        userId: currentUserId,
        cycleEntryId: symptomLog.cycleEntryId,
        date: symptomLog.date,
        symptom: symptomLog.symptom,
        severity: symptomLog.severity,
        note: undefined,
      },
    });
  });

  it('rejects symptoms linked to cycle entries outside the current user scope', async () => {
    prisma.cycleEntry.findFirst.mockResolvedValue(null);

    await expect(
      service.saveSymptom({
        date: new Date('2026-05-10T00:00:00.000Z'),
        symptom: 'Cramps',
        cycleEntryId: 'cmissingcycleentry000000001',
      }),
    ).rejects.toThrow('Cycle entry cmissingcycleentry000000001 was not found');
    expect(prisma.symptomLog.create).not.toHaveBeenCalled();
  });

  it('returns symptoms by explicit date', async () => {
    const symptomLog = createSymptomLog();
    prisma.symptomLog.findMany.mockResolvedValue([symptomLog]);

    await expect(
      service.findSymptoms({ date: symptomLog.date }),
    ).resolves.toMatchObject([
      { id: symptomLog.id, symptom: symptomLog.symptom },
    ]);
    expect(prisma.symptomLog.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        date: symptomLog.date,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  });
});
