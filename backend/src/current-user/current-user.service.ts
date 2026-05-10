import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { defaultSeedUser } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrentUserService {
  private currentUserId: string | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUserId(): Promise<string> {
    if (this.currentUserId) {
      return this.currentUserId;
    }

    const seededUser = await this.prisma.user.findUnique({
      where: { email: defaultSeedUser.email },
      select: { id: true },
    });

    if (seededUser) {
      this.currentUserId = seededUser.id;
      return seededUser.id;
    }

    const fallbackUser = await this.prisma.user.findFirst({
      orderBy: { email: 'asc' },
      select: { id: true },
    });

    if (!fallbackUser) {
      throw new InternalServerErrorException(
        'No user exists for the single-user context. Run npm run seed first.',
      );
    }

    this.currentUserId = fallbackUser.id;
    return fallbackUser.id;
  }
}
