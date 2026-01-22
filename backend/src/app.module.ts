import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalModule } from './journal/journal.module';
import { PeriodModule } from './period/period.module';
import { MoodModule } from './mood/mood.module';
import { TasksModule } from './tasks/tasks.module';
import { StickyNotesModule } from './sticky-notes/sticky-notes.module';

@Module({
  imports: [JournalModule, PeriodModule, MoodModule, TasksModule, StickyNotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
