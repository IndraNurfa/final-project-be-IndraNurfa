/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';

type Response<T> = {
  // code: number;
  message: string;
  data: T;
};

type ResponseError = {
  // code: number;
  message: string;
  details?: string;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next
      .handle()
      .pipe(map(this.handleSuccess(context)), catchError(this.handleFailed));
  }

  handleSuccess(context: ExecutionContext): (data: T) => Response<T> {
    return (data: T) => {
      const http = context.switchToHttp();

      const code = http.getResponse().statusCode;
      return {
        // code: code,
        message: code >= 400 ? 'failed' : 'success',
        data: data,
      };
    };
  }

  handleFailed = (err: Error) => {
    return throwError(() => {
      let statusCode = 500;
      let details = err.message;

      if (err instanceof HttpException) {
        statusCode = err.getStatus();

        const response = err.getResponse();
        if (typeof response === 'object' && response !== null) {
          const res = response as { message?: any };
          details = res.message;
        }
      }

      const respErr: ResponseError = {
        // code: statusCode,
        message: 'failed',
        details,
      };

      throw new HttpException(respErr, statusCode);
    });
  };
}
