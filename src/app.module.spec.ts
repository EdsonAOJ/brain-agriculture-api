import { MiddlewareConsumer } from '@nestjs/common';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should configure request id middleware for all routes', () => {
    const forRoutesMock = jest.fn();
    const applyMock = jest.fn().mockReturnValue({
      forRoutes: forRoutesMock,
    });

    const consumer = {
      apply: applyMock,
    } as unknown as MiddlewareConsumer;

    const module = new AppModule();

    module.configure(consumer);

    expect(applyMock).toHaveBeenCalledWith(RequestIdMiddleware);
    expect(forRoutesMock).toHaveBeenCalledWith('*');
  });
});
