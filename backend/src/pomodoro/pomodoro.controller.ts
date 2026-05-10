import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { zodPipe } from '../common/validation/zod-validation.pipe';
import {
  CreatePomodoroSessionDto,
  createPomodoroSessionSchema,
} from './dto/create-pomodoro-session.dto';
import type { PomodoroHistoryQueryDto } from './dto/pomodoro-query.dto';
import { pomodoroHistoryQuerySchema } from './dto/pomodoro-query.dto';
import { PomodoroService } from './pomodoro.service';

@Controller('pomodoro')
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post('sessions')
  createSession(
    @Body(zodPipe(createPomodoroSessionSchema))
    createPomodoroSessionDto: CreatePomodoroSessionDto,
  ) {
    return this.pomodoroService.createSession(createPomodoroSessionDto);
  }

  @Get('today')
  today() {
    return this.pomodoroService.today();
  }

  @Get('history')
  history(
    @Query(zodPipe(pomodoroHistoryQuerySchema))
    query: PomodoroHistoryQueryDto,
  ) {
    return this.pomodoroService.history(query);
  }
}
