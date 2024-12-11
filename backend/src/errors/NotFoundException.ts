import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageTranslationKey } from 'shared'

export class NotFoundException extends HttpException {
  constructor(message: LanguageTranslationKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'Not found',
    }

    super(error, HttpStatus.NOT_FOUND)
  }
}
