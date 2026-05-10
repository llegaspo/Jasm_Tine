import { Injectable, NotFoundException } from '@nestjs/common';
import { type Reminder, type ReminderLog } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderLogDto } from './dto/reminder-log.dto';

type ReminderWithLog = Reminder & {
  logs: ReminderLog[];
};

@Injectable()
export class RemindersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const reminders = await this.prisma.reminder.findMany({
      where: { userId: currentUserId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return reminders.map((reminder) => this.toReminderResponse(reminder));
  }

  async today() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const today = await this.getCurrentUserToday(currentUserId);
    const reminders = await this.prisma.reminder.findMany({
      where: { userId: currentUserId },
      include: {
        logs: {
          where: { date: today.date },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const reminderResponses = reminders.map((reminder) =>
      this.toReminderWithLogResponse(reminder),
    );
    const completed = reminderResponses.filter(
      (reminder) => reminder.completed,
    ).length;

    return {
      date: today.isoDate,
      timezone: today.timezone,
      reminders: reminderResponses,
      summary: {
        total: reminderResponses.length,
        completed,
        pending: reminderResponses.length - completed,
      },
    };
  }

  async log(key: string, body: ReminderLogDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const [today, reminder] = await Promise.all([
      this.getCurrentUserToday(currentUserId),
      this.findReminderByKey(currentUserId, key),
    ]);
    const reminderLog = await this.prisma.reminderLog.upsert({
      where: {
        reminderId_date: {
          reminderId: reminder.id,
          date: today.date,
        },
      },
      update: {
        amount: body?.amount,
        unit: body?.unit,
        completedAt: new Date(),
      },
      create: {
        userId: currentUserId,
        reminderId: reminder.id,
        date: today.date,
        amount: body?.amount,
        unit: body?.unit,
        completedAt: new Date(),
      },
    });

    return {
      reminder: this.toReminderResponse(reminder),
      log: this.toReminderLogResponse(reminderLog),
    };
  }

  private async findReminderByKey(
    currentUserId: string,
    key: string,
  ): Promise<Reminder> {
    const reminders = await this.prisma.reminder.findMany({
      where: { userId: currentUserId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const normalizedKey = this.normalizeKey(key);
    const reminder = reminders.find((candidate) =>
      this.normalizeKey(candidate.title).includes(normalizedKey),
    );

    if (!reminder) {
      throw new NotFoundException(`Reminder ${key} was not found`);
    }

    return reminder;
  }

  private async getCurrentUserToday(currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { timezone: true },
    });

    if (!user) {
      throw new NotFoundException('Current user was not found');
    }

    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      timeZone: user.timezone,
      year: 'numeric',
    }).formatToParts(new Date());
    const year = this.getDatePart(parts, 'year');
    const month = this.getDatePart(parts, 'month');
    const day = this.getDatePart(parts, 'day');

    return {
      date: new Date(Date.UTC(year, month - 1, day)),
      isoDate: `${year}-${String(month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`,
      timezone: user.timezone,
    };
  }

  private getDatePart(
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ): number {
    const value = parts.find((part) => part.type === type)?.value;

    if (!value) {
      throw new Error(`Unable to resolve ${type} for reminder date`);
    }

    return Number(value);
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private toReminderResponse(reminder: Reminder) {
    return {
      id: reminder.id,
      key: this.normalizeKey(reminder.title),
      title: reminder.title,
      description: reminder.description,
      icon: reminder.icon,
      actionLabel: reminder.actionLabel,
      actionIcon: reminder.actionIcon,
      tone: reminder.tone,
      cadence: reminder.cadence,
      isActive: reminder.isActive,
      sortOrder: reminder.sortOrder.toNumber(),
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString(),
    };
  }

  private toReminderWithLogResponse(reminder: ReminderWithLog) {
    const log = reminder.logs[0] ?? null;

    return {
      ...this.toReminderResponse(reminder),
      completed: log?.completedAt !== null && log?.completedAt !== undefined,
      log: log ? this.toReminderLogResponse(log) : null,
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
}
