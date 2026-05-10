import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { PeriodController } from './period.controller';
import { PeriodService } from './period.service';

describe('PeriodController', () => {
  let controller: PeriodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodController],
      providers: [
        PeriodService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CurrentUserService,
          useValue: {
            getCurrentUserId: jest.fn().mockResolvedValue('user-id'),
          },
        },
      ],
    }).compile();

    controller = module.get<PeriodController>(PeriodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
