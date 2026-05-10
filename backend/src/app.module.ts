import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalModule } from './journal/journal.module';
import { PeriodModule } from './period/period.module';
import { MoodModule } from './mood/mood.module';
import { TasksModule } from './tasks/tasks.module';
import { StickyNotesModule } from './sticky-notes/sticky-notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { CurrentUserModule } from './current-user/current-user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MilestonesModule } from './milestones/milestones.module';
import { PomodoroModule } from './pomodoro/pomodoro.module';
import { RemindersModule } from './reminders/reminders.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    CurrentUserModule,
    JournalModule,
    PeriodModule,
    MoodModule,
    TasksModule,
    StickyNotesModule,
    DashboardModule,
    MilestonesModule,
    PomodoroModule,
    RemindersModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
