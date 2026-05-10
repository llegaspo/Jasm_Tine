import { PrismaPg } from '@prisma/adapter-pg';
import { POMODORO_MODE, PrismaClient, STATUS } from '@prisma/client';
import { defaultSeedUser, getDatabaseUrl } from '../src/config/env';

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

const addDays = (days: number): Date => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const today = (): Date => addDays(0);

async function ensureUser() {
  const existingUser = await prisma.user.findFirst({
    orderBy: { email: 'asc' },
    select: { email: true, id: true },
  });

  if (existingUser) {
    console.log(
      `Seed using existing user ${existingUser.email} (${existingUser.id}).`,
    );
    return existingUser;
  }

  const user = await prisma.user.create({
    data: defaultSeedUser,
    select: { email: true, id: true },
  });

  console.log(`Seeded default user ${user.email} (${user.id}).`);
  return user;
}

async function seedProfile(userId: string): Promise<void> {
  await prisma.userProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      displayName: `${defaultSeedUser.firstName} ${defaultSeedUser.lastName}`,
      bio: 'Curating spaces and experiences that foster calm productivity.',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
      currentFocus: 'Finalizing the Spring Collection launch assets.',
    },
  });
}

async function seedTasks(userId: string): Promise<void> {
  const existingCount = await prisma.task.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  await prisma.task.createMany({
    data: [
      {
        userId,
        title: 'Review finalized copy for landing page',
        status: STATUS.TODO,
        priority: 1,
        category: 'Launch',
        tags: ['Urgent', 'Marketing'],
        sortOrder: 1,
        dueDate: addDays(1),
        scheduledDate: today(),
      },
      {
        userId,
        title: 'Sync with design team on mood board',
        status: STATUS.IN_PROGRESS,
        priority: 2,
        category: 'Design',
        tags: ['High'],
        sortOrder: 2,
        scheduledDate: today(),
      },
      {
        userId,
        title: 'Approve Q2 budget proposal',
        status: STATUS.DONE,
        completedAt: new Date(),
        priority: 3,
        category: 'Admin',
        tags: ['Finance'],
        sortOrder: 3,
      },
    ],
  });
}

async function seedStickyNotes(userId: string): Promise<void> {
  const existingCount = await prisma.stickyNote.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  await prisma.stickyNote.createMany({
    data: [
      {
        userId,
        text: "Don't forget to order more jasmine tea for the studio.",
        tone: 'primary',
        sortOrder: 1,
      },
      {
        userId,
        text: 'Send thank you card to the packaging supplier.',
        tone: 'secondary',
        sortOrder: 2,
      },
      {
        userId,
        text: "Breathe. You're doing great.",
        tone: 'tertiary',
        sortOrder: 3,
      },
    ],
  });
}

async function seedMilestones(userId: string): Promise<void> {
  const existingCount = await prisma.milestone.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  await prisma.milestone.createMany({
    data: [
      {
        userId,
        name: 'Website Launch',
        dueDate: addDays(4),
        tone: 'primary',
        category: 'Launch',
        sortOrder: 1,
      },
      {
        userId,
        name: 'Q1 Review Prep',
        dueDate: addDays(12),
        tone: 'tertiary',
        category: 'Planning',
        sortOrder: 2,
      },
    ],
  });
}

async function seedReminders(userId: string): Promise<void> {
  const existingCount = await prisma.reminder.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  await prisma.reminder.createMany({
    data: [
      {
        userId,
        title: 'Drink Water',
        description: 'Stay hydrated through your focus blocks.',
        icon: 'water_drop',
        actionLabel: '250ml',
        actionIcon: 'add',
        tone: 'primary',
        sortOrder: 1,
      },
      {
        userId,
        title: 'Stretch Break',
        description: 'Release tension from your shoulders.',
        icon: 'self_improvement',
        actionLabel: 'Mark Done',
        actionIcon: 'check',
        tone: 'tertiary',
        sortOrder: 2,
      },
      {
        userId,
        title: 'Mindful Moment',
        description: 'Take three slow, grounding breaths.',
        icon: 'spa',
        actionLabel: 'Mark Done',
        actionIcon: 'check',
        tone: 'secondary',
        sortOrder: 3,
      },
    ],
  });
}

async function seedJournalAndMood(userId: string): Promise<void> {
  const entryDate = today();

  await prisma.journalEntry.upsert({
    where: { userId_entryDate: { userId, entryDate } },
    update: {},
    create: {
      userId,
      entryDate,
      title: 'A calm start',
      content:
        'The morning started with a calm serenity. I took a few moments to breathe before opening my laptop.',
      excerpt:
        'The morning started with a calm serenity and a few grounding breaths.',
      moodLabel: 'Calm',
      moodIcon: 'spa',
      featured: true,
    },
  });

  await prisma.moodLog.upsert({
    where: { userId_date: { userId, date: entryDate } },
    update: {},
    create: {
      userId,
      date: entryDate,
      moodLabel: 'Calm',
      moodIcon: 'spa',
      intensity: 80,
    },
  });
}

async function seedCycle(userId: string): Promise<void> {
  const existingCount = await prisma.cycleEntry.count({ where: { userId } });

  if (existingCount > 0) {
    return;
  }

  const cycleEntry = await prisma.cycleEntry.create({
    data: {
      userId,
      startDate: addDays(-13),
      cycleDay: 14,
      phase: 'Ovulation',
      note: 'Starter cycle insight for the wellness dashboard.',
    },
    select: { id: true },
  });

  await prisma.symptomLog.createMany({
    data: [
      {
        userId,
        cycleEntryId: cycleEntry.id,
        date: today(),
        symptom: 'Cramps',
        severity: 2,
      },
      {
        userId,
        cycleEntryId: cycleEntry.id,
        date: today(),
        symptom: 'Fatigue',
        severity: 2,
      },
    ],
  });
}

async function seedPomodoro(userId: string): Promise<void> {
  const existingCount = await prisma.pomodoroSession.count({
    where: { userId },
  });

  if (existingCount > 0) {
    return;
  }

  await prisma.pomodoroSession.createMany({
    data: [
      {
        userId,
        title: 'Design System Review',
        mode: POMODORO_MODE.FOCUS,
        durationMinutes: 25,
        completed: true,
        atmosphere: 'Gentle Rain',
        completedAt: new Date(),
      },
      {
        userId,
        title: 'Client Email Drafts',
        mode: POMODORO_MODE.SHORT_BREAK,
        durationMinutes: 15,
        completed: true,
        atmosphere: 'Corner Cafe',
        completedAt: new Date(),
      },
    ],
  });
}

async function seedNotificationPreferences(userId: string): Promise<void> {
  const existingCount = await prisma.notificationPreference.count({
    where: { userId },
  });

  if (existingCount > 0) {
    return;
  }

  await prisma.notificationPreference.createMany({
    data: [
      {
        userId,
        key: 'weekly_digest',
        title: 'Weekly Digest',
        description: 'Receive a summary of your activity and insights.',
        enabled: true,
      },
      {
        userId,
        key: 'marketing_offers',
        title: 'Marketing & Offers',
        description: 'Updates on new features and exclusive chic drops.',
        enabled: false,
      },
      {
        userId,
        key: 'security_alerts',
        title: 'Security Alerts',
        description: 'Crucial notifications regarding your account safety.',
        enabled: true,
        locked: true,
      },
    ],
  });
}

async function main(): Promise<void> {
  const user = await ensureUser();

  await seedProfile(user.id);
  await seedTasks(user.id);
  await seedStickyNotes(user.id);
  await seedMilestones(user.id);
  await seedReminders(user.id);
  await seedJournalAndMood(user.id);
  await seedCycle(user.id);
  await seedPomodoro(user.id);
  await seedNotificationPreferences(user.id);

  console.log('Seed completed.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
