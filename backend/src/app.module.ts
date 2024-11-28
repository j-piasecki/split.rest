import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseService } from './database.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
