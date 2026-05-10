import { Injectable, NotFoundException } from '@nestjs/common';
import { type CycleEntry, type Prisma, type SymptomLog } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import {
  CreateSymptomLogInput,
  CycleSymptomQueryDto,
} from './dto/update-period.dto';

type DateRange = {
  endDate?: Date;
  startDate?: Date;
};

@Injectable()
export class PeriodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async saveEntry(createPeriodDto: CreatePeriodDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const cycleEntry = await this.prisma.cycleEntry.create({
      data: {
        userId: currentUserId,
        startDate: createPeriodDto.startDate,
        endDate: createPeriodDto.endDate,
        cycleDay: createPeriodDto.cycleDay,
        phase: createPeriodDto.phase,
        flow: createPeriodDto.flow,
        note: createPeriodDto.note,
      },
    });

    return this.toCycleEntryResponse(cycleEntry);
  }

  async summary() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const [latestEntry, recentEntries] = await Promise.all([
      this.prisma.cycleEntry.findFirst({
        where: { userId: currentUserId },
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.cycleEntry.findMany({
        where: { userId: currentUserId },
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
    ]);

    if (!latestEntry) {
      return {
        current: null,
        predictedPhase: null,
        recentEntries: [],
      };
    }

    const today = this.startOfUtcDate(new Date());
    const cycleDay =
      latestEntry.cycleDay ??
      Math.max(1, this.daysBetween(latestEntry.startDate, today) + 1);

    return {
      current: {
        ...this.toCycleEntryResponse(latestEntry),
        cycleDay,
      },
      predictedPhase: this.predictPhase(cycleDay, latestEntry),
      recentEntries: recentEntries.map((entry) =>
        this.toCycleEntryResponse(entry),
      ),
    };
  }

  async saveSymptom(symptomDto: CreateSymptomLogInput) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const cycleEntryId =
      symptomDto.cycleEntryId ??
      (await this.findCycleEntryForDate(currentUserId, symptomDto.date));

    if (symptomDto.cycleEntryId) {
      await this.ensureOwnedCycleEntry(symptomDto.cycleEntryId, currentUserId);
    }

    const symptomLog = await this.prisma.symptomLog.create({
      data: {
        userId: currentUserId,
        cycleEntryId,
        date: symptomDto.date,
        symptom: symptomDto.symptom,
        severity: symptomDto.severity,
        note: symptomDto.note,
      },
    });

    return this.toSymptomLogResponse(symptomLog);
  }

  async findSymptoms(query: CycleSymptomQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const symptoms = await this.prisma.symptomLog.findMany({
      where: this.buildSymptomWhere(currentUserId, query),
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return symptoms.map((symptom) => this.toSymptomLogResponse(symptom));
  }

  private buildSymptomWhere(
    currentUserId: string,
    query: CycleSymptomQueryDto,
  ): Prisma.SymptomLogWhereInput {
    if (query.date) {
      return {
        userId: currentUserId,
        date: query.date,
      };
    }

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

  private resolveRange(query: CycleSymptomQueryDto): DateRange {
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

  private async ensureOwnedCycleEntry(
    cycleEntryId: string,
    currentUserId: string,
  ): Promise<void> {
    const cycleEntry = await this.prisma.cycleEntry.findFirst({
      where: { id: cycleEntryId, userId: currentUserId },
      select: { id: true },
    });

    if (!cycleEntry) {
      throw new NotFoundException(`Cycle entry ${cycleEntryId} was not found`);
    }
  }

  private async findCycleEntryForDate(
    currentUserId: string,
    date: Date,
  ): Promise<string | null> {
    const cycleEntry = await this.prisma.cycleEntry.findFirst({
      where: {
        userId: currentUserId,
        startDate: { lte: date },
        OR: [{ endDate: null }, { endDate: { gte: date } }],
      },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      select: { id: true },
    });

    return cycleEntry?.id ?? null;
  }

  private predictPhase(cycleDay: number, latestEntry: CycleEntry): string {
    if (latestEntry.phase) {
      return latestEntry.phase;
    }

    if (latestEntry.flow && cycleDay <= 7) {
      return 'Period';
    }

    if (cycleDay <= 5) {
      return 'Menstrual';
    }

    if (cycleDay <= 13) {
      return 'Follicular';
    }

    if (cycleDay <= 16) {
      return 'Ovulation';
    }

    return 'Luteal';
  }

  private daysBetween(from: Date, to: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return Math.floor(
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

  private toCycleEntryResponse(cycleEntry: CycleEntry) {
    return {
      id: cycleEntry.id,
      startDate: cycleEntry.startDate.toISOString(),
      endDate: cycleEntry.endDate?.toISOString() ?? null,
      cycleDay: cycleEntry.cycleDay,
      phase: cycleEntry.phase,
      flow: cycleEntry.flow,
      note: cycleEntry.note,
      createdAt: cycleEntry.createdAt.toISOString(),
      updatedAt: cycleEntry.updatedAt.toISOString(),
    };
  }

  private toSymptomLogResponse(symptomLog: SymptomLog) {
    return {
      id: symptomLog.id,
      cycleEntryId: symptomLog.cycleEntryId,
      date: symptomLog.date.toISOString(),
      symptom: symptomLog.symptom,
      severity: symptomLog.severity,
      note: symptomLog.note,
      createdAt: symptomLog.createdAt.toISOString(),
      updatedAt: symptomLog.updatedAt.toISOString(),
    };
  }
}
