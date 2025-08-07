import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as fs from 'fs'
import { join } from 'path'

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public')
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
    maxAge: '7d',
  })
  app.enableCors()
  await app.listen(3000)
}
bootstrap()
