import { Injectable, NotFoundException } from '@nestjs/common';
import { type Milestone } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const milestones = await this.prisma.milestone.findMany({
      where: { userId: currentUserId },
      orderBy: [{ dueDate: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return milestones.map((milestone) => this.toMilestoneResponse(milestone));
  }

  async create(createMilestoneDto: CreateMilestoneDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const milestone = await this.prisma.milestone.create({
      data: {
        ...createMilestoneDto,
        userId: currentUserId,
      },
    });

    return this.toMilestoneResponse(milestone);
  }

  async update(id: string, updateMilestoneDto: UpdateMilestoneDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    await this.ensureOwnedMilestone(id, currentUserId);

    const milestone = await this.prisma.milestone.update({
      where: { id },
      data: updateMilestoneDto,
    });

    return this.toMilestoneResponse(milestone);
  }

  async remove(id: string) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const result = await this.prisma.milestone.deleteMany({
      where: { id, userId: currentUserId },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Milestone ${id} was not found`);
    }

    return { id, deleted: true };
  }

  private async ensureOwnedMilestone(
    id: string,
    currentUserId: string,
  ): Promise<void> {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id, userId: currentUserId },
      select: { id: true },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone ${id} was not found`);
    }
  }

  private toMilestoneResponse(milestone: Milestone) {
    return {
      id: milestone.id,
      name: milestone.name,
      description: milestone.description,
      dueDate: milestone.dueDate.toISOString(),
      tone: milestone.tone,
      category: milestone.category,
      completedAt: milestone.completedAt?.toISOString() ?? null,
      sortOrder: milestone.sortOrder.toNumber(),
      createdAt: milestone.createdAt.toISOString(),
      updatedAt: milestone.updatedAt.toISOString(),
    };
  }
}
