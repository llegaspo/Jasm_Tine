import { Test, TestingModule } from '@nestjs/testing';
import {
  type NotificationPreference,
  type User,
  type UserProfile,
} from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    $transaction: jest.Mock;
    notificationPreference: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    userProfile: {
      upsert: jest.Mock;
    };
  };

  const currentUserId = 'cmocksettingsuser00000000';

  const createPreference = (
    overrides: Partial<NotificationPreference> = {},
  ): NotificationPreference => ({
    id: 'cmocknotificationpref000001',
    userId: currentUserId,
    key: 'reminders',
    title: 'Reminders',
    description: 'Daily reminder nudges.',
    enabled: true,
    locked: false,
    createdAt: new Date('2026-05-11T01:00:00.000Z'),
    updatedAt: new Date('2026-05-11T01:00:00.000Z'),
    ...overrides,
  });

  const createUser = (
    profileOverrides: Partial<UserProfile> | null = {},
    userOverrides: Partial<User> = {},
  ): User & { profile: UserProfile | null } => ({
    id: currentUserId,
    firstName: 'Jasmine',
    lastName: 'Tine',
    email: 'jasmine@example.com',
    timezone: 'Asia/Manila',
    profile:
      profileOverrides === null
        ? null
        : {
            id: 'cmockprofile0000000000001',
            userId: currentUserId,
            displayName: null,
            bio: 'Calm productivity.',
            avatarUrl: null,
            currentFocus: 'Launch planning',
            createdAt: new Date('2026-05-11T01:00:00.000Z'),
            updatedAt: new Date('2026-05-11T01:00:00.000Z'),
            ...profileOverrides,
          },
    ...userOverrides,
  });

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback) => callback(prisma)),
      notificationPreference: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userProfile: {
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
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

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns current user profile data', async () => {
    const user = createUser({ displayName: 'Jasmine Studio' });
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.profile()).resolves.toEqual({
      id: currentUserId,
      firstName: 'Jasmine',
      lastName: 'Tine',
      email: 'jasmine@example.com',
      timezone: 'Asia/Manila',
      displayName: 'Jasmine Studio',
      bio: 'Calm productivity.',
      avatarUrl: null,
      currentFocus: 'Launch planning',
      greetingName: 'Jasmine Studio',
      profileUpdatedAt: '2026-05-11T01:00:00.000Z',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: currentUserId },
      include: { profile: true },
    });
  });

  it('updates user and profile fields in a transaction', async () => {
    const updatedUser = createUser(
      {
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
      },
      {
        firstName: 'Jas',
        lastName: 'Tine',
        email: 'jas@example.com',
        timezone: 'America/New_York',
      },
    );
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: currentUserId })
      .mockResolvedValueOnce(updatedUser);
    prisma.user.update.mockResolvedValue(updatedUser);
    prisma.userProfile.upsert.mockResolvedValue(updatedUser.profile);

    await expect(
      service.updateProfile({
        firstName: 'Jas',
        lastName: 'Tine',
        email: 'jas@example.com',
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
        timezone: 'America/New_York',
      }),
    ).resolves.toMatchObject({
      firstName: 'Jas',
      email: 'jas@example.com',
      bio: 'Updated bio',
      timezone: 'America/New_York',
      greetingName: 'Jas',
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: currentUserId },
      data: {
        firstName: 'Jas',
        lastName: 'Tine',
        email: 'jas@example.com',
        timezone: 'America/New_York',
      },
    });
    expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      update: {
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
      },
      create: {
        userId: currentUserId,
        bio: 'Updated bio',
        avatarUrl: 'https://example.com/avatar.png',
      },
    });
  });

  it('lists notification preferences for the current user', async () => {
    const preference = createPreference();
    prisma.notificationPreference.findMany.mockResolvedValue([preference]);

    await expect(service.notifications()).resolves.toEqual([
      expect.objectContaining({
        id: preference.id,
        key: preference.key,
        enabled: true,
      }),
    ]);
    expect(prisma.notificationPreference.findMany).toHaveBeenCalledWith({
      where: { userId: currentUserId },
      orderBy: [{ key: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('updates an unlocked notification preference', async () => {
    const preference = createPreference();
    prisma.notificationPreference.findUnique.mockResolvedValue(preference);
    prisma.notificationPreference.update.mockResolvedValue({
      ...preference,
      enabled: false,
    });

    await expect(
      service.updateNotification(preference.key, { enabled: false }),
    ).resolves.toMatchObject({
      key: preference.key,
      enabled: false,
    });
    expect(prisma.notificationPreference.update).toHaveBeenCalledWith({
      where: {
        userId_key: {
          userId: currentUserId,
          key: preference.key,
        },
      },
      data: {
        enabled: false,
      },
    });
  });

  it('rejects locked notification preferences', async () => {
    const preference = createPreference({ locked: true });
    prisma.notificationPreference.findUnique.mockResolvedValue(preference);

    await expect(
      service.updateNotification(preference.key, { enabled: false }),
    ).rejects.toThrow(
      'Notification preference reminders is locked and cannot be changed',
    );
    expect(prisma.notificationPreference.update).not.toHaveBeenCalled();
  });

  it('rejects missing notification preferences', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue(null);

    await expect(
      service.updateNotification('missing', { enabled: false }),
    ).rejects.toThrow('Notification preference missing was not found');
    expect(prisma.notificationPreference.update).not.toHaveBeenCalled();
  });
});
