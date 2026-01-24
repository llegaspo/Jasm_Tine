-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "STATUS" NOT NULL,
    "priority_level" INTEGER NOT NULL,
    "sort_order" DECIMAL(65,30) NOT NULL,
    "due_date" TIMESTAMPTZ,
    "scheduled_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day_Summary" (
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "completed_task" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Day_Summary_pkey" PRIMARY KEY ("user_id","date")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day_Summary" ADD CONSTRAINT "Day_Summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
