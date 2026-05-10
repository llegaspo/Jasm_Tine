import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import type {
  NotificationKeyParam,
  UpdateNotificationPreferenceDto,
} from './dto/update-notification-preference.dto';
import {
  notificationKeyParamSchema,
  updateNotificationPreferenceSchema,
} from './dto/update-notification-preference.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { updateProfileSchema } from './dto/update-profile.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  profile() {
    return this.settingsService.profile();
  }

  @Patch('profile')
  updateProfile(
    @Body(zodPipe(updateProfileSchema))
    body: UpdateProfileDto,
  ) {
    return this.settingsService.updateProfile(body);
  }

  @Get('notifications')
  notifications() {
    return this.settingsService.notifications();
  }

  @Patch('notifications/:key')
  updateNotification(
    @Param(zodPipe(notificationKeyParamSchema)) params: NotificationKeyParam,
    @Body(zodPipe(updateNotificationPreferenceSchema))
    body: UpdateNotificationPreferenceDto,
  ) {
    return this.settingsService.updateNotification(params.key, body);
  }
}
