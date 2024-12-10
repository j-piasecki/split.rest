import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageApiErrorKey } from 'shared'

export class ForbiddenException extends HttpException {
  constructor(message: LanguageApiErrorKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.FORBIDDEN,
      message,
      error: 'Forbidden',
    }

    super(error, HttpStatus.FORBIDDEN)
  }
}
