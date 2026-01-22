import { Test, TestingModule } from '@nestjs/testing';
import { StickyNotesService } from './sticky-notes.service';

describe('StickyNotesService', () => {
  let service: StickyNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StickyNotesService],
    }).compile();

    service = module.get<StickyNotesService>(StickyNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
