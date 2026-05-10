-- CreateEnum
CREATE TYPE "REMINDER_CADENCE" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "POMODORO_MODE" AS ENUM ('FOCUS', 'SHORT_BREAK', 'LONG_BREAK');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "description" TEXT;
ALTER TABLE "Task" ADD COLUMN "completed_at" TIMESTAMPTZ;
ALTER TABLE "Task" ADD COLUMN "category" TEXT;
ALTER TABLE "Task" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'TODO';
ALTER TABLE "Task" ALTER COLUMN "priority_level" DROP NOT NULL;
ALTER TABLE "Task" ALTER COLUMN "sort_order" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "current_focus" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickyNote" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "tone" TEXT,
    "color" TEXT,
    "sort_order" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "StickyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "due_date" DATE NOT NULL,
    "tone" TEXT,
    "category" TEXT,
    "completed_at" TIMESTAMPTZ,
    "sort_order" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "action_label" TEXT,
    "action_icon" TEXT,
    "tone" TEXT,
    "cadence" "REMINDER_CADENCE" NOT NULL DEFAULT 'DAILY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" INTEGER,
    "unit" TEXT,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "mood_label" TEXT,
    "mood_icon" TEXT,
    "image_url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood_label" TEXT NOT NULL,
    "mood_icon" TEXT,
    "intensity" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleEntry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "cycle_day" INTEGER,
    "phase" TEXT,
    "flow" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "CycleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cycle_entry_id" TEXT,
    "date" DATE NOT NULL,
    "symptom" TEXT NOT NULL,
    "severity" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "SymptomLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PomodoroSession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" "POMODORO_MODE" NOT NULL DEFAULT 'FOCUS',
    "duration_minutes" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "atmosphere" TEXT,
    "started_at" TIMESTAMPTZ,
    "ended_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PomodoroSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_user_id_key" ON "UserProfile"("user_id");
CREATE INDEX "UserProfile_user_id_idx" ON "UserProfile"("user_id");

CREATE INDEX "Task_user_id_idx" ON "Task"("user_id");
CREATE INDEX "Task_user_id_status_idx" ON "Task"("user_id", "status");
CREATE INDEX "Task_user_id_due_date_idx" ON "Task"("user_id", "due_date");
CREATE INDEX "Task_user_id_scheduled_date_idx" ON "Task"("user_id", "scheduled_date");
CREATE INDEX "Task_user_id_sort_order_idx" ON "Task"("user_id", "sort_order");
CREATE INDEX "Task_user_id_created_at_idx" ON "Task"("user_id", "created_at");

CREATE INDEX "Day_Summary_user_id_idx" ON "Day_Summary"("user_id");
CREATE INDEX "Day_Summary_date_idx" ON "Day_Summary"("date");

CREATE INDEX "StickyNote_user_id_idx" ON "StickyNote"("user_id");
CREATE INDEX "StickyNote_user_id_sort_order_idx" ON "StickyNote"("user_id", "sort_order");
CREATE INDEX "StickyNote_user_id_created_at_idx" ON "StickyNote"("user_id", "created_at");

CREATE INDEX "Milestone_user_id_idx" ON "Milestone"("user_id");
CREATE INDEX "Milestone_user_id_due_date_idx" ON "Milestone"("user_id", "due_date");
CREATE INDEX "Milestone_user_id_sort_order_idx" ON "Milestone"("user_id", "sort_order");
CREATE INDEX "Milestone_user_id_created_at_idx" ON "Milestone"("user_id", "created_at");

CREATE INDEX "Reminder_user_id_idx" ON "Reminder"("user_id");
CREATE INDEX "Reminder_user_id_is_active_idx" ON "Reminder"("user_id", "is_active");
CREATE INDEX "Reminder_user_id_sort_order_idx" ON "Reminder"("user_id", "sort_order");
CREATE INDEX "Reminder_user_id_created_at_idx" ON "Reminder"("user_id", "created_at");

CREATE UNIQUE INDEX "ReminderLog_reminder_id_date_key" ON "ReminderLog"("reminder_id", "date");
CREATE INDEX "ReminderLog_user_id_idx" ON "ReminderLog"("user_id");
CREATE INDEX "ReminderLog_user_id_date_idx" ON "ReminderLog"("user_id", "date");
CREATE INDEX "ReminderLog_user_id_created_at_idx" ON "ReminderLog"("user_id", "created_at");

CREATE UNIQUE INDEX "JournalEntry_user_id_entry_date_key" ON "JournalEntry"("user_id", "entry_date");
CREATE INDEX "JournalEntry_user_id_idx" ON "JournalEntry"("user_id");
CREATE INDEX "JournalEntry_user_id_entry_date_idx" ON "JournalEntry"("user_id", "entry_date");
CREATE INDEX "JournalEntry_user_id_created_at_idx" ON "JournalEntry"("user_id", "created_at");

CREATE UNIQUE INDEX "MoodLog_user_id_date_key" ON "MoodLog"("user_id", "date");
CREATE INDEX "MoodLog_user_id_idx" ON "MoodLog"("user_id");
CREATE INDEX "MoodLog_user_id_date_idx" ON "MoodLog"("user_id", "date");
CREATE INDEX "MoodLog_user_id_created_at_idx" ON "MoodLog"("user_id", "created_at");

CREATE INDEX "CycleEntry_user_id_idx" ON "CycleEntry"("user_id");
CREATE INDEX "CycleEntry_user_id_start_date_idx" ON "CycleEntry"("user_id", "start_date");
CREATE INDEX "CycleEntry_user_id_end_date_idx" ON "CycleEntry"("user_id", "end_date");
CREATE INDEX "CycleEntry_user_id_created_at_idx" ON "CycleEntry"("user_id", "created_at");

CREATE INDEX "SymptomLog_user_id_idx" ON "SymptomLog"("user_id");
CREATE INDEX "SymptomLog_user_id_date_idx" ON "SymptomLog"("user_id", "date");
CREATE INDEX "SymptomLog_cycle_entry_id_idx" ON "SymptomLog"("cycle_entry_id");
CREATE INDEX "SymptomLog_user_id_created_at_idx" ON "SymptomLog"("user_id", "created_at");

CREATE INDEX "PomodoroSession_user_id_idx" ON "PomodoroSession"("user_id");
CREATE INDEX "PomodoroSession_user_id_completed_at_idx" ON "PomodoroSession"("user_id", "completed_at");
CREATE INDEX "PomodoroSession_user_id_started_at_idx" ON "PomodoroSession"("user_id", "started_at");
CREATE INDEX "PomodoroSession_user_id_created_at_idx" ON "PomodoroSession"("user_id", "created_at");

CREATE UNIQUE INDEX "NotificationPreference_user_id_key_key" ON "NotificationPreference"("user_id", "key");
CREATE INDEX "NotificationPreference_user_id_idx" ON "NotificationPreference"("user_id");
CREATE INDEX "NotificationPreference_user_id_created_at_idx" ON "NotificationPreference"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StickyNote" ADD CONSTRAINT "StickyNote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "Reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CycleEntry" ADD CONSTRAINT "CycleEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_cycle_entry_id_fkey" FOREIGN KEY ("cycle_entry_id") REFERENCES "CycleEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PomodoroSession" ADD CONSTRAINT "PomodoroSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
