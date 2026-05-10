import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { StickyNotesService } from './sticky-notes.service';

describe('StickyNotesService', () => {
  let service: StickyNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<StickyNotesService>(StickyNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
