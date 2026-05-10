import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type NotificationPreference,
  type User,
  type UserProfile,
} from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

type UserWithProfile = User & {
  profile: UserProfile | null;
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async profile() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Current user was not found');
    }

    return this.toProfileResponse(user);
  }

  async updateProfile(body: UpdateProfileDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { id: currentUserId },
          select: { id: true },
        });

        if (!existingUser) {
          throw new NotFoundException('Current user was not found');
        }

        if (
          body.firstName !== undefined ||
          body.lastName !== undefined ||
          body.email !== undefined ||
          body.timezone !== undefined
        ) {
          await tx.user.update({
            where: { id: currentUserId },
            data: {
              ...(body.firstName !== undefined
                ? { firstName: body.firstName }
                : {}),
              ...(body.lastName !== undefined
                ? { lastName: body.lastName }
                : {}),
              ...(body.email !== undefined ? { email: body.email } : {}),
              ...(body.timezone !== undefined
                ? { timezone: body.timezone }
                : {}),
            },
          });
        }

        if (body.bio !== undefined || body.avatarUrl !== undefined) {
          await tx.userProfile.upsert({
            where: { userId: currentUserId },
            update: {
              ...(body.bio !== undefined ? { bio: body.bio } : {}),
              ...(body.avatarUrl !== undefined
                ? { avatarUrl: body.avatarUrl }
                : {}),
            },
            create: {
              userId: currentUserId,
              bio: body.bio,
              avatarUrl: body.avatarUrl,
            },
          });
        }

        return tx.user.findUnique({
          where: { id: currentUserId },
          include: { profile: true },
        });
      });

      if (!user) {
        throw new NotFoundException('Current user was not found');
      }

      return this.toProfileResponse(user);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already in use');
      }

      throw error;
    }
  }

  async notifications() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId: currentUserId },
      orderBy: [{ key: 'asc' }, { createdAt: 'asc' }],
    });

    return preferences.map((preference) =>
      this.toNotificationPreferenceResponse(preference),
    );
  }

  async updateNotification(key: string, body: UpdateNotificationPreferenceDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const preference = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_key: {
          userId: currentUserId,
          key,
        },
      },
    });

    if (!preference) {
      throw new NotFoundException(
        `Notification preference ${key} was not found`,
      );
    }

    if (preference.locked) {
      throw new ForbiddenException(
        `Notification preference ${key} is locked and cannot be changed`,
      );
    }

    const updatedPreference = await this.prisma.notificationPreference.update({
      where: {
        userId_key: {
          userId: currentUserId,
          key,
        },
      },
      data: {
        enabled: body.enabled,
      },
    });

    return this.toNotificationPreferenceResponse(updatedPreference);
  }

  private toNotificationPreferenceResponse(preference: NotificationPreference) {
    return {
      id: preference.id,
      key: preference.key,
      title: preference.title,
      description: preference.description,
      enabled: preference.enabled,
      locked: preference.locked,
      createdAt: preference.createdAt.toISOString(),
      updatedAt: preference.updatedAt.toISOString(),
    };
  }

  private toProfileResponse(user: UserWithProfile) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      timezone: user.timezone,
      displayName: user.profile?.displayName ?? null,
      bio: user.profile?.bio ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      currentFocus: user.profile?.currentFocus ?? null,
      greetingName: user.profile?.displayName ?? user.firstName,
      profileUpdatedAt: user.profile?.updatedAt.toISOString() ?? null,
    };
  }
}
