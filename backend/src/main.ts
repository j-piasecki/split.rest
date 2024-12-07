import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as fs from 'fs'
import { join } from 'path'

const IS_DEV = process.env.DEV === '1'

const httpsOptions = IS_DEV
  ? undefined
  : {
      key: fs.readFileSync('./secrets/private-key.pem'),
      cert: fs.readFileSync('./secrets/public-certificate.pem'),
    }

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public')
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: httpsOptions,
  })
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public',
    maxAge: '7d',
  })
  app.enableCors()
  await app.listen(IS_DEV ? 3000 : 443)
}
bootstrap()
