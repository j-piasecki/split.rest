import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageTranslationKey } from 'shared'

export class ConflictException extends HttpException {
  constructor(message: LanguageTranslationKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
    }

    super(error, HttpStatus.CONFLICT)
  }
}
