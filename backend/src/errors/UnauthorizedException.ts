import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageTranslationKey } from 'shared'

export class UnauthorizedException extends HttpException {
  constructor(message: LanguageTranslationKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
    }

    super(error, HttpStatus.UNAUTHORIZED)
  }
}
