import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { JournalService } from './journal.service';

describe('JournalService', () => {
  let service: JournalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue('user-id'),
          },
        },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
