import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageApiErrorKey } from 'shared'

export class ConflictException extends HttpException {
  constructor(message: LanguageApiErrorKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.CONFLICT,
      message,
      error: 'Conflict',
    }

    super(error, HttpStatus.CONFLICT)
  }
}
