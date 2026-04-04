import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { json } from 'express'
import * as fs from 'fs'
import { Logger } from 'nestjs-pino'
import { join } from 'path'

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public')
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
  })
  app.enableCors()
  app.use(json({ limit: '20kb' }))
  await app.listen(3000)
}
bootstrap()
