import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type NotificationPreference } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

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
}
