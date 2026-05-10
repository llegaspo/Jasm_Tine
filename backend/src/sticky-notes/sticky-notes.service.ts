import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type StickyNote } from '@prisma/client';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BulkStickyNotesDto } from './dto/create-sticky-note.dto';

@Injectable()
export class StickyNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async findAll() {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const notes = await this.prisma.stickyNote.findMany({
      where: { userId: currentUserId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return notes.map((note) => this.toStickyNoteResponse(note));
  }

  async bulkSave(body: BulkStickyNotesDto) {
    const currentUserId = await this.currentUserService.getCurrentUserId();
    const noteIds = body.notes.flatMap((note) => (note.id ? [note.id] : []));

    const notes = await this.prisma.$transaction(async (tx) => {
      if (noteIds.length > 0) {
        const ownedNotes = await tx.stickyNote.findMany({
          where: {
            id: { in: noteIds },
            userId: currentUserId,
          },
          select: { id: true },
        });

        if (ownedNotes.length !== noteIds.length) {
          throw new NotFoundException(
            'One or more sticky notes were not found',
          );
        }
      }

      await tx.stickyNote.deleteMany({
        where: {
          userId: currentUserId,
          ...(noteIds.length > 0 ? { id: { notIn: noteIds } } : {}),
        },
      });

      await Promise.all(
        body.notes.map((note, index) => {
          const data = {
            text: note.text,
            tone: note.tone,
            color: note.color,
            sortOrder: note.sortOrder ?? new Prisma.Decimal(index + 1),
          };

          if (note.id) {
            return tx.stickyNote.update({
              where: { id: note.id },
              data,
            });
          }

          return tx.stickyNote.create({
            data: {
              ...data,
              userId: currentUserId,
            },
          });
        }),
      );

      return tx.stickyNote.findMany({
        where: { userId: currentUserId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
    });

    return notes.map((note) => this.toStickyNoteResponse(note));
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
}
