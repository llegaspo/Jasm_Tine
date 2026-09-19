import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ApiReminder, ApiService, ApiStickyNote, ApiTask } from '../core/api.service';

type BadgeTone = 'urgent' | 'high';
type AccentTone = 'primary' | 'secondary' | 'tertiary';

interface PriorityTask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly dueLabel: string;
  readonly flagged: boolean;
  readonly badge?: {
    readonly label: string;
    readonly tone: BadgeTone;
  };
}

interface DailyReminder {
  readonly key: string;
  readonly title: string;
  readonly description: string | null;
  readonly icon: string;
  readonly action: string;
  readonly actionIcon: string;
  readonly tone: AccentTone;
  readonly completed: boolean;
}

interface Milestone {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly dueLabel: string;
  readonly daysLeft: number;
  readonly tone: AccentTone;
}

interface Note {
  readonly id?: string;
  readonly text: string;
}

interface FinishedTask {
  readonly id: string;
  readonly title: string;
  readonly completedOn: string;
  readonly tags: readonly string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly userName = signal('Jasmine');
  protected readonly currentFocus = signal('Finalizing the Spring Collection launch assets.');
  protected readonly dashboardDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly formattedDashboardDate = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(this.toCalendarDate(this.dashboardDate())),
  );

  protected readonly priorityTasks = signal<readonly PriorityTask[]>([]);
  protected readonly dailyReminders = signal<readonly DailyReminder[]>([]);
  protected readonly milestones = signal<readonly Milestone[]>([]);
  protected readonly notes = signal<readonly Note[]>([]);
  protected readonly finishedTasks = signal<readonly FinishedTask[]>([]);
  protected readonly isNotesModalOpen = signal(false);
  protected readonly isFinishedTasksModalOpen = signal(false);
  protected readonly notesDraft = signal('');

  ngOnInit(): void {
    this.loadDashboard();
  }

  @HostListener('document:keydown.escape')
  protected closeOpenModalFromKeyboard(): void {
    if (this.isFinishedTasksModalOpen()) {
      this.closeFinishedTasksModal();
      return;
    }

    if (this.isNotesModalOpen()) {
      this.closeNotesModal();
    }
  }

  protected openFinishedTasksModal(): void {
    this.isFinishedTasksModalOpen.set(true);
  }

  protected closeFinishedTasksModal(): void {
    this.isFinishedTasksModalOpen.set(false);
  }

  protected openNotesModal(): void {
    this.notesDraft.set(this.notes().map((note) => note.text).join('\n'));
    this.isNotesModalOpen.set(true);
  }

  protected closeNotesModal(): void {
    this.isNotesModalOpen.set(false);
  }

  protected updateNotesDraft(event: Event): void {
    this.notesDraft.set((event.target as HTMLTextAreaElement).value);
  }

  protected completeTask(task: PriorityTask): void {
    if (task.completed) {
      return;
    }

    this.api.completeTask(task.id).subscribe(() => this.loadDashboard());
  }

  protected completeReminder(reminder: DailyReminder): void {
    if (reminder.completed) {
      return;
    }

    this.api.logReminder(reminder.key).subscribe(() => this.loadDashboard());
  }

  protected saveNotes(): void {
    const existingNotes = this.notes();
    const nextNotes = this.notesDraft()
      .split('\n')
      .map((note) => note.trim())
      .filter(Boolean)
      .map((text, index) => ({
        ...(existingNotes[index]?.id ? { id: existingNotes[index].id } : {}),
        text,
        sortOrder: index + 1,
      }));

    this.api.saveStickyNotes(nextNotes).subscribe((notes) => {
      this.notes.set(notes.map((note) => this.toNote(note)));
      this.closeNotesModal();
    });
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.api.getDashboardToday().subscribe({
      next: (dashboard) => {
        this.dashboardDate.set(dashboard.today.date);
        this.userName.set(dashboard.profile.greetingName || dashboard.profile.firstName);
        this.currentFocus.set(dashboard.profile.currentFocus ?? 'A calm and focused day.');
        this.priorityTasks.set(dashboard.priorityTasks.map((task) => this.toPriorityTask(task)));
        this.dailyReminders.set(
          dashboard.activeReminders.map((reminder) => this.toDailyReminder(reminder)),
        );
        this.milestones.set(
          dashboard.upcomingMilestones.map((milestone) => ({
            id: milestone.id,
            name: milestone.name,
            description: milestone.description,
            dueLabel: this.formatCalendarDate(milestone.dueDate),
            daysLeft: milestone.daysLeft ?? 0,
            tone: this.toAccentTone(milestone.tone),
          })),
        );
        this.notes.set(dashboard.stickyNotes.map((note) => this.toNote(note)));
        this.finishedTasks.set(
          dashboard.finishedTasksToday.map((task) => this.toFinishedTask(task)),
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private toPriorityTask(task: ApiTask): PriorityTask {
    const tag = task.tags[0];

    return {
      id: task.id,
      title: task.title,
      completed: task.completed,
      dueLabel: this.formatTaskDueDate(task.dueDate ?? task.scheduledDate),
      flagged: (task.priority ?? 0) > 0 || task.tags.some((tag) => /urgent|high/i.test(tag)),
      ...(tag
        ? {
            badge: {
              label: tag,
              tone: tag.toLowerCase().includes('urgent') ? 'urgent' : 'high',
            },
          }
        : {}),
    };
  }

  private toDailyReminder(reminder: ApiReminder): DailyReminder {
    return {
      key: this.normalizeKey(reminder.key ?? reminder.title),
      title: reminder.title,
      description: reminder.description,
      icon: reminder.icon ?? 'notifications',
      action: reminder.completed ? 'Done' : (reminder.actionLabel ?? 'Mark Done'),
      actionIcon: reminder.completed ? 'check' : (reminder.actionIcon ?? 'check'),
      tone: this.toAccentTone(reminder.tone),
      completed: reminder.completed ?? false,
    };
  }

  private toFinishedTask(task: ApiTask): FinishedTask {
    return {
      id: task.id,
      title: task.title,
      completedOn: task.completedAt ? `Completed ${this.formatShortDate(task.completedAt)}` : 'Completed',
      tags: task.tags,
    };
  }

  private toNote(note: ApiStickyNote): Note {
    return {
      id: note.id,
      text: note.text,
    };
  }

  private toAccentTone(tone: string | null): AccentTone {
    return tone === 'secondary' || tone === 'tertiary' ? tone : 'primary';
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private formatShortDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(value));
  }

  private formatTaskDueDate(value: string | null): string {
    if (!value) {
      return 'Upcoming';
    }

    const dueDate = value.slice(0, 10);
    const today = this.dashboardDate();

    if (dueDate === today) {
      return 'Today';
    }

    const tomorrow = this.toCalendarDate(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dueDate === this.toDateKey(tomorrow)) {
      return 'Tomorrow';
    }

    const daysAway = Math.round(
      (this.toCalendarDate(dueDate).getTime() - this.toCalendarDate(today).getTime()) / 86_400_000,
    );
    if (daysAway > 1 && daysAway <= 7) {
      return 'This Week';
    }

    return this.formatCalendarDate(value);
  }

  private formatCalendarDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(this.toCalendarDate(value));
  }

  private toCalendarDate(value: string): Date {
    return new Date(`${value.slice(0, 10)}T12:00:00`);
  }

  private toDateKey(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
