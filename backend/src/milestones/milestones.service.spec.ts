import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, type Milestone } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { MilestonesService } from './milestones.service';

describe('MilestonesService', () => {
  let service: MilestonesService;
  let prisma: {
    milestone: {
      create: jest.Mock;
      deleteMany: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  const currentUserId = 'cmockmileuser0000000000000';

  const createMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
    id: 'cmockmile000000000000000001',
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
    ...overrides,
  });

  beforeEach(async () => {
    prisma = {
      milestone: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MilestonesService,
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

    service = module.get<MilestonesService>(MilestonesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lists current user milestones by due date', async () => {
    const milestone = createMilestone();
    prisma.milestone.findMany.mockResolvedValue([milestone]);

    await expect(service.findAll()).resolves.toEqual([
      {
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        dueDate: '2026-05-14T00:00:00.000Z',
        tone: milestone.tone,
        category: milestone.category,
        completedAt: null,
        sortOrder: 1,
        createdAt: '2026-05-10T01:00:00.000Z',
        updatedAt: '2026-05-10T01:00:00.000Z',
      },
    ]);
    expect(prisma.milestone.findMany).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      orderBy: [{ dueDate: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('creates a milestone for the current user only', async () => {
    const milestone = createMilestone();
    prisma.milestone.create.mockResolvedValue(milestone);

    await expect(
      service.create({
        name: milestone.name,
        dueDate: milestone.dueDate,
        tone: milestone.tone,
      }),
    ).resolves.toMatchObject({
      id: milestone.id,
      name: milestone.name,
    });
    expect(prisma.milestone.create).toHaveBeenCalledWith({
      data: {
        name: milestone.name,
        dueDate: milestone.dueDate,
        tone: milestone.tone,
        userId: currentUserId,
      },
    });
  });

  it('updates only owned milestones', async () => {
    const milestone = createMilestone({ name: 'Updated Launch' });
    prisma.milestone.findFirst.mockResolvedValue({ id: milestone.id });
    prisma.milestone.update.mockResolvedValue(milestone);

    await expect(
      service.update(milestone.id, { name: milestone.name }),
    ).resolves.toMatchObject({
      id: milestone.id,
      name: milestone.name,
    });
    expect(prisma.milestone.findFirst).toHaveBeenCalledWith({
      where: { id: milestone.id, userId: currentUserId },
      select: { id: true },
    });
    expect(prisma.milestone.update).toHaveBeenCalledWith({
      where: { id: milestone.id },
      data: { name: milestone.name },
    });
  });

  it('rejects updates for milestones outside the current user scope', async () => {
    prisma.milestone.findFirst.mockResolvedValue(null);

    await expect(
      service.update('cmissingmile000000000000001', { name: 'Nope' }),
    ).rejects.toThrow('Milestone cmissingmile000000000000001 was not found');
    expect(prisma.milestone.update).not.toHaveBeenCalled();
  });

  it('deletes milestones within the current user scope', async () => {
    const milestone = createMilestone();
    prisma.milestone.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.remove(milestone.id)).resolves.toEqual({
      id: milestone.id,
      deleted: true,
    });
    expect(prisma.milestone.deleteMany).toHaveBeenCalledWith({
      where: { id: milestone.id, userId: currentUserId },
    });
  });
});
