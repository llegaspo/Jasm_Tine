import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import type { ReminderKeyParam, ReminderLogDto } from './dto/reminder-log.dto';
import {
  reminderKeyParamSchema,
  reminderLogSchema,
} from './dto/reminder-log.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll() {
    return this.remindersService.findAll();
  }

  @Get('today')
  today() {
    return this.remindersService.today();
  }

  @Post(':key/log')
  log(
    @Param(zodPipe(reminderKeyParamSchema)) params: ReminderKeyParam,
    @Body(zodPipe(reminderLogSchema)) body?: ReminderLogDto,
  ) {
    return this.remindersService.log(params.key, body);
  }
}
