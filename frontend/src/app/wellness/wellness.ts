import { Component, signal } from '@angular/core';

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
  templateUrl: './wellness.html',
})
export class Wellness {
  protected readonly journalDate = signal('October 24, 2023');
  protected readonly journalDraft = signal(
    "The morning started with a calm serenity that I haven't felt in weeks. I took a few moments to just breathe before opening my laptop. The sunlight filtering through the curtains cast a soft, warm glow that set a gentle tone for the rest of the day.",
  );

  protected readonly jasmineNote: WellnessNote = {
    author: 'Notes from Jasmine',
    message: 'Remember to hydrate and take deep breaths today. Your energy is precious.',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
  };

  protected readonly symptoms: readonly SymptomTag[] = [{ label: 'Cramps' }, { label: 'Fatigue' }];

  protected readonly moodOptions: readonly MoodOption[] = [
    { label: 'Joyful', icon: 'auto_awesome' },
    { label: 'Calm', icon: 'spa', selected: true },
    { label: 'Anxious', icon: 'rainy' },
    { label: 'Tired', icon: 'battery_2_bar' },
  ];

  protected readonly moodPatterns: readonly MoodPattern[] = [
    { day: 'M', intensity: 40, tone: 'tertiary' },
    { day: 'T', intensity: 60, tone: 'secondary' },
    { day: 'W', intensity: 80, tone: 'primary', active: true },
    { day: 'T', intensity: 30, tone: 'surface' },
    { day: 'F', intensity: 50, tone: 'tertiary' },
    { day: 'S', intensity: 10, tone: 'surface', projected: true },
    { day: 'S', intensity: 10, tone: 'surface', projected: true },
  ];
}
