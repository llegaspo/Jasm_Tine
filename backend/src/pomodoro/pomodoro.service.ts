import { Injectable, NotFoundException } from '@nestjs/common';
import {
  POMODORO_MODE,
  type PomodoroSession,
  type Prisma,
} from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePomodoroSessionDto } from './dto/create-pomodoro-session.dto';
import { PomodoroHistoryQueryDto } from './dto/pomodoro-query.dto';

type DateRange = {
  endDate?: Date;
  startDate?: Date;
};

@Injectable()
export class PomodoroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async createSession(createPomodoroSessionDto: CreatePomodoroSessionDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const completed = createPomodoroSessionDto.skipped
      ? false
      : createPomodoroSessionDto.completed;
    const session = await this.prisma.pomodoroSession.create({
      data: {
        userId: currentUserId,
        title: createPomodoroSessionDto.taskTitle ?? 'Untitled Focus Session',
        mode: createPomodoroSessionDto.mode,
        durationMinutes: createPomodoroSessionDto.duration,
        completed,
        atmosphere: createPomodoroSessionDto.atmosphere,
        startedAt: createPomodoroSessionDto.startedAt,
        endedAt: createPomodoroSessionDto.endedAt,
        completedAt: completed
          ? (createPomodoroSessionDto.endedAt ?? new Date())
          : null,
      },
    });

    return this.toSessionResponse(session);
  }

  async today() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const today = await this.getCurrentUserToday(currentUserId);
    const sessions = await this.prisma.pomodoroSession.findMany({
      where: {
        userId: currentUserId,
        startedAt: {
          gte: today.startsAt,
          lt: today.endsAt,
        },
      },
      orderBy: [{ startedAt: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      date: today.isoDate,
      timezone: today.timezone,
      sessions: sessions.map((session) => this.toSessionResponse(session)),
      summary: this.toSummary(sessions),
    };
  }

  async history(query: PomodoroHistoryQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const range = this.resolveRange(query);
    const sessions = await this.prisma.pomodoroSession.findMany({
      where: this.buildSessionWhere(currentUserId, range),
      orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      range: {
        startDate: range.startDate?.toISOString() ?? null,
        endDate: range.endDate?.toISOString() ?? null,
      },
      sessions: sessions.map((session) => this.toSessionResponse(session)),
      summary: this.toSummary(sessions),
    };
  }

  private buildSessionWhere(
    currentUserId: string,
    range: DateRange,
  ): Prisma.PomodoroSessionWhereInput {
    return {
      userId: currentUserId,
      ...(range.startDate || range.endDate
        ? {
            startedAt: {
              ...(range.startDate ? { gte: range.startDate } : {}),
              ...(range.endDate ? { lte: range.endDate } : {}),
            },
          }
        : {}),
    };
  }

  private resolveRange(query: PomodoroHistoryQueryDto): DateRange {
    if (query.startDate || query.endDate) {
      return {
        startDate: query.startDate,
        endDate: query.endDate,
      };
    }

    if (!query.range) {
      return {};
    }

    const today = this.startOfUtcDate(new Date());
    const startDate = new Date(today);
    startDate.setUTCDate(
      today.getUTCDate() - (query.range === 'month' ? 29 : 6),
    );

    return {
      startDate,
      endDate: today,
    };
  }

  private async getCurrentUserToday(currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { timezone: true },
    });

    if (!user) {
      throw new NotFoundException('Current user was not found');
    }

    const localToday = this.getLocalDateParts(new Date(), user.timezone);
    const nextLocalDay = this.addDays(localToday, 1);

    return {
      isoDate: this.toIsoDate(localToday),
      timezone: user.timezone,
      startsAt: this.localDateTimeToUtc(localToday, user.timezone),
      endsAt: this.localDateTimeToUtc(nextLocalDay, user.timezone),
    };
  }

  private getLocalDateParts(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    }).formatToParts(date);

    return {
      day: this.getDatePart(parts, 'day'),
      month: this.getDatePart(parts, 'month'),
      year: this.getDatePart(parts, 'year'),
    };
  }

  private localDateTimeToUtc(
    parts: { day: number; month: number; year: number },
    timezone: string,
  ): Date {
    const targetTime = Date.UTC(parts.year, parts.month - 1, parts.day);
    let utcDate = new Date(targetTime);

    for (let iteration = 0; iteration < 3; iteration += 1) {
      const actualParts = this.getLocalDateTimeParts(utcDate, timezone);
      const actualTime = Date.UTC(
        actualParts.year,
        actualParts.month - 1,
        actualParts.day,
        actualParts.hour,
        actualParts.minute,
        actualParts.second,
      );
      utcDate = new Date(utcDate.getTime() - (actualTime - targetTime));
    }

    return utcDate;
  }

  private getLocalDateTimeParts(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      year: 'numeric',
    }).formatToParts(date);

    return {
      day: this.getDatePart(parts, 'day'),
      hour: this.getDatePart(parts, 'hour'),
      minute: this.getDatePart(parts, 'minute'),
      month: this.getDatePart(parts, 'month'),
      second: this.getDatePart(parts, 'second'),
      year: this.getDatePart(parts, 'year'),
    };
  }

  private getDatePart(
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ): number {
    const value = parts.find((part) => part.type === type)?.value;

    if (!value) {
      throw new Error(`Unable to resolve ${type} for pomodoro date`);
    }

    return Number(value);
  }

  private addDays(
    parts: { day: number; month: number; year: number },
    days: number,
  ) {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    date.setUTCDate(date.getUTCDate() + days);

    return {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
    };
  }

  private toIsoDate(parts: {
    day: number;
    month: number;
    year: number;
  }): string {
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');

    return `${parts.year}-${month}-${day}`;
  }

  private startOfUtcDate(date: Date): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  private toSummary(sessions: PomodoroSession[]) {
    const completedSessions = sessions.filter((session) => session.completed);
    const skippedSessions = sessions.filter((session) => !session.completed);
    const focusSessions = sessions.filter(
      (session) => session.mode === POMODORO_MODE.FOCUS,
    );
    const completedFocusSessions = completedSessions.filter(
      (session) => session.mode === POMODORO_MODE.FOCUS,
    );

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      skippedSessions: skippedSessions.length,
      focusSessions: focusSessions.length,
      focusMinutes: focusSessions.reduce(
        (total, session) => total + session.durationMinutes,
        0,
      ),
      completedFocusMinutes: completedFocusSessions.reduce(
        (total, session) => total + session.durationMinutes,
        0,
      ),
      breakMinutes: sessions
        .filter((session) => session.mode !== POMODORO_MODE.FOCUS)
        .reduce((total, session) => total + session.durationMinutes, 0),
    };
  }

  private toSessionResponse(session: PomodoroSession) {
    return {
      id: session.id,
      taskTitle: session.title,
      mode: session.mode,
      duration: session.durationMinutes,
      completed: session.completed,
      skipped: !session.completed,
      atmosphere: session.atmosphere,
      startedAt: session.startedAt?.toISOString() ?? null,
      endedAt: session.endedAt?.toISOString() ?? null,
      completedAt: session.completedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
