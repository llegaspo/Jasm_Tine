import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api (GET)', () => {
    return request(app.getHttpAdapter().getInstance())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/tasks/:id (PATCH) returns 400 for invalid route params', () => {
    return request(app.getHttpAdapter().getInstance())
      .patch('/api/tasks/not-a-cuid')
      .send({ title: 'Valid title' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('Route params validation failed');
        expect(body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'id',
              message: 'Expected a valid CUID',
            }),
          ]),
        );
      });
  });

  it('/api/tasks/:id (PATCH) returns 400 for invalid body', () => {
    return request(app.getHttpAdapter().getInstance())
      .patch('/api/tasks/c123456789012345678901234')
      .send({ priority: 'high' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('Body validation failed');
        expect(body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'priority',
            }),
          ]),
        );
      });
  });

  it('/api/mood-logs (GET) returns 400 for invalid query', () => {
    return request(app.getHttpAdapter().getInstance())
      .get('/api/mood-logs?range=year')
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('Query params validation failed');
        expect(body.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: 'range',
            }),
          ]),
        );
      });
  });
});
