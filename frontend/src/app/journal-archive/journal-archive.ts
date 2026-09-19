import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiJournalEntry, ApiService } from '../core/api.service';

interface JournalEntry {
  readonly id: string;
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
export class JournalArchive implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly entries = signal<readonly JournalEntry[]>([]);

  ngOnInit(): void {
    this.api.getJournalEntries().subscribe((entries) => {
      this.entries.set(entries.map((entry) => this.toJournalEntry(entry)));
    });
  }

  private toJournalEntry(entry: ApiJournalEntry): JournalEntry {
    return {
      id: entry.id,
      date: this.formatDate(entry.date),
      title: entry.title,
      excerpt: entry.excerpt ?? entry.content.slice(0, 180),
      mood: entry.moodIcon ?? 'edit_note',
      moodLabel: entry.moodLabel ?? 'Journal entry',
      featured: entry.featured,
      imageUrl: entry.imageUrl ?? undefined,
    };
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }
}
