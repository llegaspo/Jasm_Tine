import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type DaySummary,
  type Milestone,
  type Reminder,
  type ReminderLog,
  type StickyNote,
  STATUS,
  type Task,
} from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';

type LocalDateParts = {
  day: number;
  month: number;
  year: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async getToday() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        timezone: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            avatarUrl: true,
            currentFocus: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Current user was not found');
    }

    const today = this.getTodayContext(user.timezone);

    const [
      priorityTasks,
      unfinishedTasks,
      finishedTasks,
      activeReminders,
      reminderLogs,
      upcomingMilestones,
      stickyNotes,
      daySummary,
    ] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId: currentUserId,
          priority: { not: null },
        },
        orderBy: [
          { priority: 'asc' },
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      this.prisma.task.findMany({
        where: {
          userId: currentUserId,
          scheduledDate: today.date,
          status: { not: STATUS.DONE },
          completedAt: null,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.task.findMany({
        where: {
          userId: currentUserId,
          completedAt: {
            gte: today.startsAt,
            lt: today.endsAt,
          },
        },
        orderBy: [{ completedAt: 'desc' }, { sortOrder: 'asc' }],
      }),
      this.prisma.reminder.findMany({
        where: {
          userId: currentUserId,
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.reminderLog.findMany({
        where: {
          userId: currentUserId,
          date: today.date,
        },
      }),
      this.prisma.milestone.findMany({
        where: {
          userId: currentUserId,
          completedAt: null,
          dueDate: { gte: today.date },
        },
        orderBy: [
          { dueDate: 'asc' },
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      this.prisma.stickyNote.findMany({
        where: { userId: currentUserId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.daySummary.findUnique({
        where: {
          userId_date: {
            userId: currentUserId,
            date: today.date,
          },
        },
      }),
    ]);

    const reminderLogByReminderId = new Map(
      reminderLogs.map((log) => [log.reminderId, log]),
    );
    const activeReminderResponses = activeReminders.map((reminder) =>
      this.toReminderResponse(
        reminder,
        reminderLogByReminderId.get(reminder.id) ?? null,
      ),
    );
    const completedReminderCount = activeReminderResponses.filter(
      (reminder) => reminder.completed,
    ).length;

    return {
      profile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName:
          user.profile?.displayName ?? `${user.firstName} ${user.lastName}`,
        email: user.email,
        bio: user.profile?.bio ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        currentFocus: user.profile?.currentFocus ?? null,
        greetingName: user.profile?.displayName ?? user.firstName,
      },
      today: {
        date: today.isoDate,
        timezone: user.timezone,
        startsAt: today.startsAt.toISOString(),
        endsAt: today.endsAt.toISOString(),
      },
      priorityTasks: priorityTasks.map((task) => this.toTaskResponse(task)),
      unfinishedTasksToday: unfinishedTasks.map((task) =>
        this.toTaskResponse(task),
      ),
      finishedTasksToday: finishedTasks.map((task) =>
        this.toTaskResponse(task),
      ),
      activeReminders: activeReminderResponses,
      reminderStatus: {
        date: today.isoDate,
        total: activeReminderResponses.length,
        completed: completedReminderCount,
        pending: activeReminderResponses.length - completedReminderCount,
        logs: reminderLogs.map((log) => this.toReminderLogResponse(log)),
      },
      upcomingMilestones: upcomingMilestones.map((milestone) =>
        this.toMilestoneResponse(milestone, today.date),
      ),
      stickyNotes: stickyNotes.map((note) => this.toStickyNoteResponse(note)),
      daySummary: daySummary ? this.toDaySummaryResponse(daySummary) : null,
    };
  }

  private getTodayContext(timezone: string) {
    const localToday = this.getLocalDateParts(new Date(), timezone);
    const nextLocalDay = this.addDays(localToday, 1);
    const date = this.toDateOnly(localToday);

    return {
      date,
      isoDate: this.toIsoDate(localToday),
      startsAt: this.localDateTimeToUtc(localToday, timezone),
      endsAt: this.localDateTimeToUtc(nextLocalDay, timezone),
    };
  }

  private getLocalDateParts(date: Date, timezone: string): LocalDateParts {
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

  private localDateTimeToUtc(parts: LocalDateParts, timezone: string): Date {
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
      throw new Error(`Unable to resolve ${type} for dashboard date`);
    }

    return Number(value);
  }

  private addDays(parts: LocalDateParts, days: number): LocalDateParts {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    date.setUTCDate(date.getUTCDate() + days);

    return {
      day: date.getUTCDate(),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
    };
  }

  private toDateOnly(parts: LocalDateParts): Date {
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  }

  private toIsoDate(parts: LocalDateParts): string {
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');

    return `${parts.year}-${month}-${day}`;
  }

  private daysBetween(from: Date, to: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (this.startOfUtcDate(to).getTime() -
        this.startOfUtcDate(from).getTime()) /
        millisecondsPerDay,
    );
  }

  private startOfUtcDate(date: Date): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  private isTaskCompleted(task: Task): boolean {
    return task.status === STATUS.DONE || task.completedAt !== null;
  }

  private toTaskResponse(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      completed: this.isTaskCompleted(task),
      completedAt: task.completedAt?.toISOString() ?? null,
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      sortOrder: task.sortOrder.toNumber(),
      dueDate: task.dueDate?.toISOString() ?? null,
      scheduledDate: task.scheduledDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private toReminderResponse(reminder: Reminder, log: ReminderLog | null) {
    return {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      icon: reminder.icon,
      actionLabel: reminder.actionLabel,
      actionIcon: reminder.actionIcon,
      tone: reminder.tone,
      cadence: reminder.cadence,
      isActive: reminder.isActive,
      sortOrder: reminder.sortOrder.toNumber(),
      completed: log?.completedAt !== null && log?.completedAt !== undefined,
      log: log ? this.toReminderLogResponse(log) : null,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString(),
    };
  }

  private toReminderLogResponse(log: ReminderLog) {
    return {
      id: log.id,
      reminderId: log.reminderId,
      date: log.date.toISOString(),
      amount: log.amount,
      unit: log.unit,
      completedAt: log.completedAt?.toISOString() ?? null,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }

  private toMilestoneResponse(milestone: Milestone, today: Date) {
    return {
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      dueDate: milestone.dueDate.toISOString(),
      daysLeft: this.daysBetween(today, milestone.dueDate),
      tone: milestone.tone,
      category: milestone.category,
      completedAt: milestone.completedAt?.toISOString() ?? null,
      sortOrder: milestone.sortOrder.toNumber(),
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    };
  }

  private toStickyNoteResponse(note: StickyNote) {
    return {
      id: note.id,
      text: note.text,
      tone: note.tone,
      color: note.color,
      sortOrder: note.sortOrder.toNumber(),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  private toDaySummaryResponse(summary: DaySummary) {
    return {
      date: summary.date.toISOString(),
      totalTasks: summary.totalTasks,
      completedTask: summary.completedTask,
    };
  }
}
