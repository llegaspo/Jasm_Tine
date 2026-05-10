import { Component, computed, signal } from '@angular/core';

type BadgeTone = 'urgent' | 'high';
type FeatureTone = 'primary' | 'secondary' | 'tertiary';

interface PriorityTask {
  readonly id: number;
  readonly title: string;
  readonly completed: boolean;
  readonly badge?: {
    readonly label: string;
    readonly tone: BadgeTone;
  };
}

interface RoadmapFeature {
  readonly name: string;
  readonly icon: string;
  readonly progress: number;
  readonly tone: FeatureTone;
}

interface Milestone {
  readonly name: string;
  readonly daysLeft: number;
  readonly tone: FeatureTone;
}

interface Note {
  readonly id: number;
  readonly text: string;
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

  protected readonly roadmapFeatures: readonly RoadmapFeature[] = [
    { name: 'Journal & Diary', icon: 'auto_stories', progress: 75, tone: 'primary' },
    { name: 'Cycle Tracker', icon: 'calendar_month', progress: 40, tone: 'tertiary' },
    { name: 'Mood Tracker', icon: 'mood', progress: 15, tone: 'secondary' },
  ];

  protected readonly milestones: readonly Milestone[] = [
    { name: 'Website Launch', daysLeft: 4, tone: 'primary' },
    { name: 'Q1 Review Prep', daysLeft: 12, tone: 'tertiary' },
  ];

  protected readonly notes: readonly Note[] = [
    { id: 1, text: "Don't forget to order more jasmine tea for the studio." },
    { id: 2, text: 'Send thank you card to the packaging supplier.' },
    { id: 3, text: "Breathe. You're doing great." },
  ];
}
