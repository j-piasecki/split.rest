import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable, catchError, tap, throwError } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const { method, url, body, query } = request
    const userId = request.user?.sub ?? 'anonymous'
    const startTime = Date.now()

    const args = method === 'GET' || method === 'DELETE' ? query : body
    const handler = context.getHandler().name

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime
        this.logger.log({ userId, handler, method, url, args, duration })
      }),
      catchError((error) => {
        const duration = Date.now() - startTime
        const status = error instanceof HttpException ? error.getStatus() : 500

        if (status >= 500) {
          this.logger.error({ userId, handler, method, url, args, duration, status, error: error.message })
        } else {
          this.logger.warn({ userId, handler, method, url, args, duration, status, error: error.message })
        }

        return throwError(() => error)
      })
    )
  }
}
