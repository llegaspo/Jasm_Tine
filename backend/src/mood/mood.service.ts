import { Injectable } from '@nestjs/common';
import { type MoodLog, type Prisma } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { MoodLogQueryDto } from './dto/update-mood.dto';

type DateRange = {
  endDate?: Date;
  startDate?: Date;
};

@Injectable()
export class MoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async save(createMoodDto: CreateMoodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const moodLog = await this.prisma.moodLog.upsert({
      where: {
        userId_date: {
          userId: currentUserId,
          date: createMoodDto.date,
        },
      },
      update: {
        moodLabel: createMoodDto.moodLabel,
        moodIcon: createMoodDto.moodIcon,
        intensity: createMoodDto.intensity,
        note: createMoodDto.note,
      },
      create: {
        userId: currentUserId,
        date: createMoodDto.date,
        moodLabel: createMoodDto.moodLabel,
        moodIcon: createMoodDto.moodIcon,
        intensity: createMoodDto.intensity,
        note: createMoodDto.note,
      },
    });

    return this.toMoodLogResponse(moodLog);
  }

  async findAll(query: MoodLogQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const moodLogs = await this.prisma.moodLog.findMany({
      where: this.buildMoodWhere(currentUserId, query),
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    return moodLogs.map((moodLog) => this.toMoodLogResponse(moodLog));
  }

  async summary(query: MoodLogQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const moodLogs = await this.prisma.moodLog.findMany({
      where: this.buildMoodWhere(currentUserId, {
        range: query.range ?? 'week',
        startDate: query.startDate,
        endDate: query.endDate,
      }),
      orderBy: [{ date: 'asc' }],
    });

    if (moodLogs.length === 0) {
      return {
        count: 0,
        averageIntensity: null,
        mostFrequentMood: null,
        latest: null,
        byMood: [],
        logs: [],
      };
    }

    const intensityTotal = moodLogs.reduce(
      (total, moodLog) => total + moodLog.intensity,
      0,
    );
    const moodCounts = new Map<string, number>();

    for (const moodLog of moodLogs) {
      moodCounts.set(
        moodLog.moodLabel,
        (moodCounts.get(moodLog.moodLabel) ?? 0) + 1,
      );
    }

    const byMood = [...moodCounts.entries()]
      .map(([moodLabel, count]) => ({ moodLabel, count }))
      .sort((first, second) => second.count - first.count);

    return {
      count: moodLogs.length,
      averageIntensity: Math.round(intensityTotal / moodLogs.length),
      mostFrequentMood: byMood[0]?.moodLabel ?? null,
      latest: this.toMoodLogResponse(moodLogs[moodLogs.length - 1]),
      byMood,
      logs: moodLogs.map((moodLog) => this.toMoodLogResponse(moodLog)),
    };
  }

  private buildMoodWhere(
    currentUserId: string,
    query: MoodLogQueryDto,
  ): Prisma.MoodLogWhereInput {
    const range = this.resolveRange(query);

    return {
      userId: currentUserId,
      ...(range.startDate || range.endDate
        ? {
            date: {
              ...(range.startDate ? { gte: range.startDate } : {}),
              ...(range.endDate ? { lte: range.endDate } : {}),
            },
          }
        : {}),
    };
  }

  private resolveRange(query: MoodLogQueryDto): DateRange {
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

  private startOfUtcDate(date: Date): Date {
    const utcDate = new Date(date);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  }

  private toMoodLogResponse(moodLog: MoodLog) {
    return {
      id: moodLog.id,
      date: moodLog.date.toISOString(),
      moodLabel: moodLog.moodLabel,
      moodIcon: moodLog.moodIcon,
      intensity: moodLog.intensity,
      note: moodLog.note,
      createdAt: moodLog.createdAt.toISOString(),
      updatedAt: moodLog.updatedAt.toISOString(),
    };
  }
}
