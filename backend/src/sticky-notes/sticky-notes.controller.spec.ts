import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { StickyNotesController } from './sticky-notes.controller';
import { StickyNotesService } from './sticky-notes.service';

describe('StickyNotesController', () => {
  let controller: StickyNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StickyNotesController],
      providers: [
        StickyNotesService,
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue('user-id'),
          },
        },
      ],
    }).compile();

    controller = module.get<StickyNotesController>(StickyNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
