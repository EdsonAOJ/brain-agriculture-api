import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it('should return API root information', () => {
    expect(controller.getRoot()).toEqual({
      name: 'Brain Agriculture API',
      status: 'running',
      docs: '/docs',
      health: '/health',
      dashboard: '/dashboard/summary',
    });
  });
});
