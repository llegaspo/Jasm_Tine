import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUserService } from '../current-user/current-user.service';
import { PrismaService } from '../prisma/prisma.service';
import { PomodoroController } from './pomodoro.controller';
import { PomodoroService } from './pomodoro.service';

describe('PomodoroController', () => {
  let controller: PomodoroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroController],
      providers: [
        PomodoroService,
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

    controller = module.get<PomodoroController>(PomodoroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
