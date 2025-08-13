import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializationInterceptor<T> implements NestInterceptor {
  constructor(private readonly dtoClass: new (...args: any[]) => T) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<T | T[] | null> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return null;
        const serialized = Array.isArray(data)
          ? data.map((item) =>
              plainToInstance(this.dtoClass, item, {
                excludeExtraneousValues: true,
              }),
            )
          : plainToInstance(this.dtoClass, data, {
              excludeExtraneousValues: true,
            });
        return serialized;
      }),
    );
  }
}
