import { Test, TestingModule } from '@nestjs/testing';
import { type JournalEntry } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JournalService } from './journal.service';

describe('JournalService', () => {
  let service: JournalService;
  let prisma: {
    journalEntry: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };

  const currentUserId = 'cmockjournaluser0000000000';

  const createEntry = (
    overrides: Partial<JournalEntry> = {},
  ): JournalEntry => ({
    id: 'cmockjournal00000000000001',
    userId: currentUserId,
    entryDate: new Date('2026-05-10T00:00:00.000Z'),
    title: 'A calm start',
    content: 'The morning started with a calm serenity.',
    excerpt: 'The morning started calmly.',
    moodLabel: 'Calm',
    moodIcon: 'spa',
    imageUrl: null,
    featured: false,
    createdAt: new Date('2026-05-10T01:00:00.000Z'),
    updatedAt: new Date('2026-05-10T01:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-10T02:00:00.000Z'));

    prisma = {
      journalEntry: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Manila' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
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

    service = module.get<JournalService>(JournalService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a journal entry for the current user only', async () => {
    const entry = createEntry();
    prisma.journalEntry.create.mockResolvedValue(entry);

    await expect(
      service.create({
        date: entry.entryDate,
        title: entry.title,
        content: entry.content,
        excerpt: entry.excerpt,
        mood: entry.moodLabel,
        moodIcon: entry.moodIcon,
      }),
    ).resolves.toMatchObject({
      id: entry.id,
      date: '2026-05-10T00:00:00.000Z',
      title: entry.title,
      mood: entry.moodLabel,
    });
    expect(prisma.journalEntry.create).toHaveBeenCalledWith({
      data: {
        entryDate: entry.entryDate,
        title: entry.title,
        content: entry.content,
        excerpt: entry.excerpt,
        moodLabel: entry.moodLabel,
        moodIcon: entry.moodIcon,
        imageUrl: undefined,
        featured: undefined,
        userId: currentUserId,
      },
    });
  });

  it('lists current user journal entries with filters newest first', async () => {
    prisma.journalEntry.findMany.mockResolvedValue([]);

    await service.findAll({
      range: {
        from: new Date('2026-05-01T00:00:00.000Z'),
        to: new Date('2026-05-10T00:00:00.000Z'),
      },
      mood: 'calm',
      search: 'morning',
    });

    expect(prisma.journalEntry.findMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        entryDate: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lte: new Date('2026-05-10T00:00:00.000Z'),
        },
        moodLabel: {
          contains: 'calm',
          mode: 'insensitive',
        },
        OR: [
          {
            title: {
              contains: 'morning',
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: 'morning',
              mode: 'insensitive',
            },
          },
          {
            excerpt: {
              contains: 'morning',
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('returns one owned journal entry', async () => {
    const entry = createEntry();
    prisma.journalEntry.findFirst.mockResolvedValue(entry);

    await expect(service.findOne(entry.id)).resolves.toMatchObject({
      id: entry.id,
      title: entry.title,
    });
    expect(prisma.journalEntry.findFirst).toHaveBeenCalledWith({
      where: { id: entry.id, userId: currentUserId },
    });
  });

  it('returns today journal entry when it exists', async () => {
    const entry = createEntry();
    prisma.journalEntry.findUnique.mockResolvedValue(entry);

    await expect(service.findToday()).resolves.toMatchObject({
      id: entry.id,
      date: '2026-05-10T00:00:00.000Z',
    });
    expect(prisma.journalEntry.findUnique).toHaveBeenCalledWith({
      where: {
        userId_entryDate: {
          userId: currentUserId,
          entryDate: new Date('2026-05-10T00:00:00.000Z'),
        },
      },
    });
  });

  it('returns null when today journal entry does not exist', async () => {
    prisma.journalEntry.findUnique.mockResolvedValue(null);

    await expect(service.findToday()).resolves.toBeNull();
  });

  it('updates only owned journal entries', async () => {
    const entry = createEntry({ title: 'Updated title' });
    prisma.journalEntry.findFirst.mockResolvedValue(entry);
    prisma.journalEntry.update.mockResolvedValue(entry);

    await expect(
      service.update(entry.id, { title: entry.title }),
    ).resolves.toMatchObject({
      id: entry.id,
      title: entry.title,
    });
    expect(prisma.journalEntry.update).toHaveBeenCalledWith({
      where: { id: entry.id },
      data: { title: entry.title },
    });
  });

  it('rejects updates for journal entries outside the current user scope', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue(null);

    await expect(
      service.update('cmissingjournal00000000001', { title: 'Nope' }),
    ).rejects.toThrow('Journal entry cmissingjournal00000000001 was not found');
    expect(prisma.journalEntry.update).not.toHaveBeenCalled();
  });

  it('deletes journal entries within the current user scope', async () => {
    const entry = createEntry();
    prisma.journalEntry.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.remove(entry.id)).resolves.toEqual({
      id: entry.id,
      deleted: true,
    });
    expect(prisma.journalEntry.deleteMany).toHaveBeenCalledWith({
      where: { id: entry.id, userId: currentUserId },
    });
  });
});
