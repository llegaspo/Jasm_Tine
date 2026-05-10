import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';

describe('MoodController', () => {
  let controller: MoodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodController],
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

    controller = module.get<MoodController>(MoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
