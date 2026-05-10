import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, type StickyNote } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { StickyNotesService } from './sticky-notes.service';

describe('StickyNotesService', () => {
  let service: StickyNotesService;
  let prisma: {
    $transaction: jest.Mock;
    stickyNote: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  const currentUserId = 'cmocknoteuser0000000000000';

  const createNote = (overrides: Partial<StickyNote> = {}): StickyNote => ({
    id: 'cmocknote000000000000000001',
    userId: currentUserId,
    text: 'Order jasmine tea',
    tone: 'primary',
    color: null,
    sortOrder: new Prisma.Decimal(1),
    createdAt: new Date('2026-05-10T01:00:00.000Z'),
    updatedAt: new Date('2026-05-10T01:00:00.000Z'),
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback) => callback(prisma)),
      stickyNote: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StickyNotesService,
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

    service = module.get<StickyNotesService>(StickyNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists current user notes ordered by sort order', async () => {
    const note = createNote();
    prisma.stickyNote.findMany.mockResolvedValue([note]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: note.id,
        text: note.text,
        tone: note.tone,
        color: note.color,
        sortOrder: 1,
        createdAt: '2026-05-10T01:00:00.000Z',
        updatedAt: '2026-05-10T01:00:00.000Z',
      },
    ]);
    expect(prisma.stickyNote.findMany).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('bulk saves notes in a transaction and deletes removed notes', async () => {
    const existingNote = createNote();
    const createdNote = createNote({
      id: 'cmocknote000000000000000002',
      text: 'Send thank you card',
      sortOrder: new Prisma.Decimal(2),
    });
    prisma.stickyNote.findMany
      .mockResolvedValueOnce([{ id: existingNote.id }])
      .mockResolvedValueOnce([existingNote, createdNote]);
    prisma.stickyNote.update.mockResolvedValue(existingNote);
    prisma.stickyNote.create.mockResolvedValue(createdNote);

    const result = await service.bulkSave({
      notes: [
        {
          id: existingNote.id,
          text: existingNote.text,
          tone: 'primary',
          color: null,
          sortOrder: new Prisma.Decimal(1),
        },
        {
          text: createdNote.text,
          tone: null,
          color: '#ffffff',
          sortOrder: new Prisma.Decimal(2),
        },
      ],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.stickyNote.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: currentUserId,
        id: { notIn: [existingNote.id] },
      },
    });
    expect(prisma.stickyNote.update).toHaveBeenCalledWith({
      where: { id: existingNote.id },
      data: {
        text: existingNote.text,
        tone: 'primary',
        color: null,
        sortOrder: new Prisma.Decimal(1),
      },
    });
    expect(prisma.stickyNote.create).toHaveBeenCalledWith({
      data: {
        text: createdNote.text,
        tone: null,
        color: '#ffffff',
        sortOrder: new Prisma.Decimal(2),
        userId: currentUserId,
      },
    });
    expect(result).toHaveLength(2);
  });

  it('rejects bulk updates for notes outside the current user scope', async () => {
    prisma.stickyNote.findMany.mockResolvedValue([]);

    await expect(
      service.bulkSave({
        notes: [
          {
            id: 'cmissingnote000000000000001',
            text: 'Outside note',
          },
        ],
      }),
    ).rejects.toThrow('One or more sticky notes were not found');
    expect(prisma.stickyNote.update).not.toHaveBeenCalled();
  });
});
