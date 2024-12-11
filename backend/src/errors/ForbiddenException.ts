import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageTranslationKey } from 'shared'

export class ForbiddenException extends HttpException {
  constructor(message: LanguageTranslationKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      error: 'Forbidden',
    }

    super(error, HttpStatus.FORBIDDEN)
  }
}
