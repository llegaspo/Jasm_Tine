import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        SettingsService,
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

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
