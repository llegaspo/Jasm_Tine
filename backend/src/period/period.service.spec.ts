import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { PeriodService } from './period.service';

describe('PeriodService', () => {
  let service: PeriodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodService,
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue('user-id'),
          },
        },
      ],
    }).compile();

    service = module.get<PeriodService>(PeriodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
