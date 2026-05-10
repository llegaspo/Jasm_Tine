import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: { getToday: jest.Mock };

  beforeEach(async () => {
    service = {
      getToday: jest.fn().mockResolvedValue({ today: { date: '2026-05-10' } }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns today dashboard payload from the service', async () => {
    await expect(controller.today()).resolves.toEqual({
      today: { date: '2026-05-10' },
    });
    expect(service.getToday).toHaveBeenCalledTimes(1);
  });
});
