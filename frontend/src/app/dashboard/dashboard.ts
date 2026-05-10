import { Component, HostListener, computed, signal } from '@angular/core';

type BadgeTone = 'urgent' | 'high';
type AccentTone = 'primary' | 'secondary' | 'tertiary';

interface PriorityTask {
  readonly id: number;
  readonly title: string;
  readonly completed: boolean;
  readonly badge?: {
    readonly label: string;
    readonly tone: BadgeTone;
  };
}

interface DailyReminder {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly action: string;
  readonly actionIcon: string;
  readonly tone: AccentTone;
}

interface Milestone {
  readonly name: string;
  readonly daysLeft: number;
  readonly tone: AccentTone;
}

interface Note {
  readonly id: number;
  readonly text: string;
}

interface FinishedTask {
  readonly id: number;
  readonly title: string;
  readonly completedOn: string;
  readonly tags: readonly string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly userName = signal('Jasmine');
  protected readonly currentFocus = signal('Finalizing the Spring Collection launch assets.');

  protected readonly greeting = computed(() => `Good morning, ${this.userName()}.`);

  protected readonly priorityTasks: readonly PriorityTask[] = [
    {
      id: 1,
      title: 'Review finalized copy for landing page',
      completed: false,
      badge: { label: 'Urgent', tone: 'urgent' },
    },
    {
      id: 2,
      title: 'Sync with design team on mood board',
      completed: false,
      badge: { label: 'High', tone: 'high' },
    },
    {
      id: 3,
      title: 'Approve Q2 budget proposal',
      completed: true,
    },
  ];

  protected readonly dailyReminders: readonly DailyReminder[] = [
    {
      title: 'Drink Water',
      description: 'Stay hydrated through your focus blocks.',
      icon: 'water_drop',
      action: '250ml',
      actionIcon: 'add',
      tone: 'primary',
    },
    {
      title: 'Stretch Break',
      description: 'Release tension from your shoulders.',
      icon: 'self_improvement',
      action: 'Mark Done',
      actionIcon: 'check',
      tone: 'tertiary',
    },
    {
      title: 'Mindful Moment',
      description: 'Take three slow, grounding breaths.',
      icon: 'spa',
      action: 'Mark Done',
      actionIcon: 'check',
      tone: 'secondary',
    },
  ];

  protected readonly milestones: readonly Milestone[] = [
    { name: 'Website Launch', daysLeft: 4, tone: 'primary' },
    { name: 'Q1 Review Prep', daysLeft: 12, tone: 'tertiary' },
  ];

  protected readonly notes = signal<readonly Note[]>([
    { id: 1, text: "Don't forget to order more jasmine tea for the studio." },
    { id: 2, text: 'Send thank you card to the packaging supplier.' },
    { id: 3, text: "Breathe. You're doing great." },
  ]);
  protected readonly finishedTasks: readonly FinishedTask[] = [
    {
      id: 1,
      title: 'Finalize Q3 Wellness Report',
      completedOn: 'Completed Oct 24',
      tags: ['Urgent', 'Analytics'],
    },
    {
      id: 2,
      title: 'Update Team Roster & Permissions',
      completedOn: 'Completed Oct 22',
      tags: ['High', 'Admin'],
    },
    {
      id: 3,
      title: 'Review Vendor Proposals for Retreat',
      completedOn: 'Completed Oct 20',
      tags: ['Medium'],
    },
    {
      id: 4,
      title: 'Draft October Newsletter Content',
      completedOn: 'Completed Oct 18',
      tags: ['Low', 'Marketing'],
    },
  ];
  protected readonly isNotesModalOpen = signal(false);
  protected readonly isFinishedTasksModalOpen = signal(false);
  protected readonly notesDraft = signal('');

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

  protected saveNotes(): void {
    const updatedNotes = this.notesDraft()
      .split('\n')
      .map((note) => note.trim())
      .filter(Boolean)
      .map((text, index) => ({ id: index + 1, text }));

    this.notes.set(updatedNotes);
    this.closeNotesModal();
  }
}
