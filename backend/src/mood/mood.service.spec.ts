import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { MoodService } from './mood.service';

describe('MoodService', () => {
  let service: MoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodService,
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue('user-id'),
          },
        },
      ],
    }).compile();

    service = module.get<MoodService>(MoodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
