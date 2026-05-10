import { Injectable, NotFoundException } from '@nestjs/common';
import { type JournalEntry, type Prisma } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalQueryDto } from './dto/journal-query.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async create(createJournalDto: CreateJournalDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const journalEntry = await this.prisma.journalEntry.create({
      data: {
        entryDate: createJournalDto.date,
        title: createJournalDto.title,
        content: createJournalDto.content,
        excerpt: createJournalDto.excerpt,
        moodLabel: createJournalDto.mood,
        moodIcon: createJournalDto.moodIcon,
        imageUrl: createJournalDto.imageUrl,
        featured: createJournalDto.featured,
        userId: currentUserId,
      },
    });

    return this.toJournalResponse(journalEntry);
  }

  async findAll(query: JournalQueryDto = {}) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const entries = await this.prisma.journalEntry.findMany({
      where: this.buildJournalWhere(currentUserId, query),
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
    });

    return entries.map((entry) => this.toJournalResponse(entry));
  }

  async findOne(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const journalEntry = await this.findOwnedJournalEntry(id, currentUserId);

    return this.toJournalResponse(journalEntry);
  }

  async findToday() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const today = await this.getCurrentUserToday(currentUserId);
    const journalEntry = await this.prisma.journalEntry.findUnique({
      where: {
        userId_entryDate: {
          userId: currentUserId,
          entryDate: today,
        },
      },
    });

    return journalEntry ? this.toJournalResponse(journalEntry) : null;
  }

  async update(id: string, updateJournalDto: UpdateJournalDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    await this.findOwnedJournalEntry(id, currentUserId);

    const journalEntry = await this.prisma.journalEntry.update({
      where: { id },
      data: this.toJournalData(updateJournalDto),
    });

    return this.toJournalResponse(journalEntry);
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const result = await this.prisma.journalEntry.deleteMany({
      where: { id, userId: currentUserId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Journal entry ${id} was not found`);
    }

    return { id, deleted: true };
  }

  private buildJournalWhere(
    currentUserId: string,
    query: JournalQueryDto,
  ): Prisma.JournalEntryWhereInput {
    const dateRange = {
      from: query.from ?? query.range?.from,
      to: query.to ?? query.range?.to,
    };
    const where: Prisma.JournalEntryWhereInput = {
      userId: currentUserId,
    };

    if (query.date) {
      where.entryDate = query.date;
    } else if (dateRange.from || dateRange.to) {
      where.entryDate = {
        ...(dateRange.from ? { gte: dateRange.from } : {}),
        ...(dateRange.to ? { lte: dateRange.to } : {}),
      };
    }

    if (query.mood) {
      where.moodLabel = {
        contains: query.mood,
        mode: 'insensitive',
      };
    }

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private async findOwnedJournalEntry(
    id: string,
    currentUserId: string,
  ): Promise<JournalEntry> {
    const journalEntry = await this.prisma.journalEntry.findFirst({
      where: { id, userId: currentUserId },
    });

    if (!journalEntry) {
      throw new NotFoundException(`Journal entry ${id} was not found`);
    }

    return journalEntry;
  }

  private async getCurrentUserToday(currentUserId: string): Promise<Date> {
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

    return new Date(Date.UTC(year, month - 1, day));
  }

  private getDatePart(
    parts: Intl.DateTimeFormatPart[],
    type: Intl.DateTimeFormatPartTypes,
  ): number {
    const value = parts.find((part) => part.type === type)?.value;

    if (!value) {
      throw new Error(`Unable to resolve ${type} for journal date`);
    }

    return Number(value);
  }

  private toJournalData(
    dto: CreateJournalDto | UpdateJournalDto,
  ): Prisma.JournalEntryUncheckedUpdateInput {
    return {
      ...(dto.date !== undefined ? { entryDate: dto.date } : {}),
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.content !== undefined ? { content: dto.content } : {}),
      ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
      ...(dto.mood !== undefined ? { moodLabel: dto.mood } : {}),
      ...(dto.moodIcon !== undefined ? { moodIcon: dto.moodIcon } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
    };
  }

  private toJournalResponse(journalEntry: JournalEntry) {
    return {
      id: journalEntry.id,
      date: journalEntry.entryDate.toISOString(),
      title: journalEntry.title,
      content: journalEntry.content,
      excerpt: journalEntry.excerpt,
      mood: journalEntry.moodLabel,
      moodLabel: journalEntry.moodLabel,
      moodIcon: journalEntry.moodIcon,
      imageUrl: journalEntry.imageUrl,
      featured: journalEntry.featured,
      createdAt: journalEntry.createdAt.toISOString(),
      updatedAt: journalEntry.updatedAt.toISOString(),
    };
  }
}
