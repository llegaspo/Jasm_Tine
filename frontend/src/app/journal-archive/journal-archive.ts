import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface JournalEntry {
  readonly date: string;
  readonly title: string;
  readonly excerpt: string;
  readonly mood: string;
  readonly moodLabel: string;
  readonly featured?: boolean;
  readonly imageUrl?: string;
}

@Component({
  selector: 'app-journal-archive',
  imports: [RouterLink],
  templateUrl: './journal-archive.html',
})
export class JournalArchive {
  protected readonly entries: readonly JournalEntry[] = [
    {
      date: 'October 24, 2023',
      title: 'A profound morning of stillness',
      excerpt:
        'Today was incredibly peaceful. I took a long walk by the lake and let my thoughts settle before touching any devices. The air was crisp, and for the first time in weeks, I felt a deep sense of alignment between my current tasks and my broader life goals.',
      mood: 'sentiment_satisfied',
      moodLabel: 'Peaceful',
      featured: true,
      imageUrl:
        'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=80',
    },
    {
      date: 'October 22, 2023',
      title: 'Breakthrough moments',
      excerpt:
        'Had a major breakthrough with the new project this afternoon. Feeling deeply inspired and aligned with my goals. The pieces finally connected after hours of feeling stuck.',
      mood: 'auto_awesome',
      moodLabel: 'Inspired',
    },
    {
      date: 'October 18, 2023',
      title: 'Permission to rest',
      excerpt:
        'A bit of a heavy day emotionally. Needed to take a step back and just breathe. Sometimes resting is the most productive thing you can do.',
      mood: 'rainy',
      moodLabel: 'Heavy',
    },
    {
      date: 'October 15, 2023',
      title: 'Small victories',
      excerpt:
        'Morning coffee tasted better today. Sat by the window for an hour before checking my phone. Small victories in establishing boundaries with technology.',
      mood: 'local_cafe',
      moodLabel: 'Cozy',
    },
    {
      date: 'October 10, 2023',
      title: 'Hands in the earth',
      excerpt:
        'Planted the new seeds in the garden. There is something profoundly grounding about having your hands in the soil. It puts all my abstract worries into perspective.',
      mood: 'psychiatry',
      moodLabel: 'Grounded',
    },
  ];
}
