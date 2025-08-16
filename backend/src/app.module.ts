import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseService } from './database.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Applying global throttle guard
    },
  ],
})
export class AppModule {}
