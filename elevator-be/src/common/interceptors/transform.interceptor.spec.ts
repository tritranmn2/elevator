import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const createMockContext = (statusCode: number = HttpStatus.OK, query: any = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ query }),
        getResponse: () => ({ statusCode }),
      }),
    }) as any;

  it('should wrap single object into standardized format { success: true, statusCode, data }', (done) => {
    const context = createMockContext(HttpStatus.OK);
    const handler: CallHandler = {
      handle: () => of({ id: 1, name: 'Elevator 1' }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        data: { id: 1, name: 'Elevator 1' },
      });
      done();
    });
  });

  it('should format paginated data with page, perPage, total, and data array', (done) => {
    const context = createMockContext(HttpStatus.OK, { page: '2', perPage: '5' });
    const handler: CallHandler = {
      handle: () =>
        of({
          data: [{ id: 1 }, { id: 2 }],
          total: 10,
        }),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        page: 2,
        perPage: 5,
        total: 10,
        data: [{ id: 1 }, { id: 2 }],
      });
      done();
    });
  });

  it('should handle null/undefined data with { success: false, data: null, message: "No data found" }', (done) => {
    const context = createMockContext(HttpStatus.OK);
    const handler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        success: false,
        statusCode: HttpStatus.OK,
        data: null,
        message: 'No data found',
      });
      done();
    });
  });
});
