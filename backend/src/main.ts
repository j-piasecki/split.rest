import { AppModule } from './app.module'
import { NestFactory } from '@nestjs/core'
import * as fs from 'fs'

const IS_DEV = process.env.DEV === '1'

const httpsOptions = IS_DEV
  ? undefined
  : {
      key: fs.readFileSync('./secrets/private-key.pem'),
      cert: fs.readFileSync('./secrets/public-certificate.pem'),
    }

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: httpsOptions,
  })
  app.enableCors()
  await app.listen(IS_DEV ? 3000 : 443)
}
bootstrap()
