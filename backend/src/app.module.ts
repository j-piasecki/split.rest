import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseService } from './database.service'
import { ImageService } from './image.service'
import { LoggingInterceptor } from './logging.interceptor'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 0,
        limit: 0,
        getTracker: (req) => req.headers.authorization,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        redact: ['req.headers.authorization'],
        ...(process.env.DEV === '1'
          ? {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true, singleLine: true },
              },
            }
          : {}),
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    ImageService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Applying global throttle guard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
