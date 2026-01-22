import { Module } from '@nestjs/common';
import { StickyNotesService } from './sticky-notes.service';
import { StickyNotesController } from './sticky-notes.controller';

@Module({
  controllers: [StickyNotesController],
  providers: [StickyNotesService],
})
export class StickyNotesModule {}
