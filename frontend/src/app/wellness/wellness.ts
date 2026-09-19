import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApiJournalEntry,
  ApiMoodLog,
  ApiService,
  ApiSymptomLog,
} from '../core/api.service';

type MoodTone = 'tertiary' | 'secondary' | 'primary' | 'surface';

interface WellnessNote {
  readonly author: string;
  readonly message: string;
  readonly avatarUrl: string;
}

interface SymptomTag {
  readonly label: string;
}

interface MoodOption {
  readonly label: string;
  readonly icon: string;
  readonly intensity: number;
  readonly selected?: boolean;
}

interface MoodPattern {
  readonly day: string;
  readonly intensity: number;
  readonly tone: MoodTone;
  readonly active?: boolean;
  readonly projected?: boolean;
}

@Component({
  selector: 'app-wellness',
  imports: [RouterLink],
  templateUrl: './wellness.html',
})
export class Wellness implements OnInit {
  private readonly api = inject(ApiService);
  private todayEntryId: string | null = null;
  private selectedMoodLabel: string | null = null;
  private selectedMoodIcon: string | null = null;

  protected readonly journalDate = signal(this.formatDate(this.todayIsoDate()));
  protected readonly journalDraft = signal('');

  protected readonly jasmineNote: WellnessNote = {
    author: 'Notes from Jasmine',
    message: 'Remember to hydrate and take deep breaths today. Your energy is precious.',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
  };

  protected readonly symptoms = signal<readonly SymptomTag[]>([]);
  protected readonly cycleDay = signal<number | null>(null);
  protected readonly cyclePhase = signal('Cycle tracking');

  protected readonly moodOptions = signal<readonly MoodOption[]>([
    { label: 'Joyful', icon: 'auto_awesome', intensity: 90 },
    { label: 'Calm', icon: 'spa', intensity: 80 },
    { label: 'Anxious', icon: 'rainy', intensity: 45 },
    { label: 'Tired', icon: 'battery_2_bar', intensity: 35 },
  ]);

  protected readonly moodPatterns = signal<readonly MoodPattern[]>([]);

  ngOnInit(): void {
    this.loadJournal();
    this.loadMoodSummary();
    this.loadCycle();
  }

  protected updateJournalDraft(event: Event): void {
    this.journalDraft.set((event.target as HTMLTextAreaElement).value);
  }

  protected saveJournal(): void {
    const content = this.journalDraft().trim();

    if (!content) {
      return;
    }

    const body = {
      date: this.todayIsoDate(),
      title: 'Daily Reflection',
      content,
      excerpt: content.slice(0, 160),
      mood: this.selectedMoodLabel,
      moodIcon: this.selectedMoodIcon,
    };
    const request = this.todayEntryId
      ? this.api.updateJournalEntry(this.todayEntryId, body)
      : this.api.createJournalEntry(body);

    request.subscribe((entry) => this.applyJournal(entry));
  }

  protected saveMood(mood: MoodOption): void {
    this.api
      .saveMoodLog({
        date: this.todayIsoDate(),
        moodLabel: mood.label,
        moodIcon: mood.icon,
        intensity: mood.intensity,
      })
      .subscribe((log) => {
        this.selectedMoodLabel = log.moodLabel;
        this.selectedMoodIcon = log.moodIcon;
        this.moodOptions.update((options) =>
          options.map((option) => ({
            ...option,
            selected: option.label === log.moodLabel,
          })),
        );
        this.loadMoodSummary();
      });
  }

  private loadJournal(): void {
    this.api.getTodayJournal().subscribe((entry) => {
      if (entry) {
        this.applyJournal(entry);
      }
    });
  }

  private loadMoodSummary(): void {
    this.api.getMoodSummary('week').subscribe((summary) => {
      this.moodPatterns.set(this.toMoodPatterns(summary.logs));

      if (summary.latest) {
        this.selectedMoodLabel = summary.latest.moodLabel;
        this.selectedMoodIcon = summary.latest.moodIcon;
        this.moodOptions.update((options) =>
          options.map((option) => ({
            ...option,
            selected: option.label === summary.latest?.moodLabel,
          })),
        );
      }
    });
  }

  private loadCycle(): void {
    this.api.getCycleSummary().subscribe((summary) => {
      this.cycleDay.set(summary.current?.cycleDay ?? null);
      this.cyclePhase.set(summary.predictedPhase ?? summary.current?.phase ?? 'Cycle tracking');
    });

    this.api.getCycleSymptoms({ range: 'week' }).subscribe((symptoms) => {
      this.symptoms.set(symptoms.map((symptom) => this.toSymptomTag(symptom)));
    });
  }

  private applyJournal(entry: ApiJournalEntry): void {
    this.todayEntryId = entry.id;
    this.journalDate.set(this.formatDate(entry.date));
    this.journalDraft.set(entry.content);
  }

  private toMoodPatterns(logs: readonly ApiMoodLog[]): readonly MoodPattern[] {
    if (logs.length === 0) {
      return this.weekDays().map((day, index) => ({
        day,
        intensity: 10,
        tone: 'surface',
        projected: index >= 5,
      }));
    }

    const byIsoDate = new Map(logs.map((log) => [log.date.slice(0, 10), log]));
    const today = new Date(this.todayIsoDate());

    return this.weekDays().map((day, index) => {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - (6 - index));
      const log = byIsoDate.get(date.toISOString().slice(0, 10));
      const intensity = log?.intensity ?? 10;

      return {
        day,
        intensity,
        tone: this.toMoodTone(intensity),
        active: date.toISOString().slice(0, 10) === this.todayIsoDate(),
        projected: !log,
      };
    });
  }

  private toSymptomTag(symptom: ApiSymptomLog): SymptomTag {
    return { label: symptom.symptom };
  }

  private toMoodTone(intensity: number): MoodTone {
    if (intensity >= 75) {
      return 'primary';
    }

    if (intensity >= 55) {
      return 'secondary';
    }

    if (intensity >= 35) {
      return 'tertiary';
    }

    return 'surface';
  }

  private todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private weekDays(): readonly string[] {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }
}
