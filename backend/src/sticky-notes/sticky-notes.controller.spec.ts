import { Test, TestingModule } from '@nestjs/testing';
import { StickyNotesController } from './sticky-notes.controller';
import { StickyNotesService } from './sticky-notes.service';

describe('StickyNotesController', () => {
  let controller: StickyNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StickyNotesController],
      providers: [StickyNotesService],
    }).compile();

    controller = module.get<StickyNotesController>(StickyNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
