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
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
