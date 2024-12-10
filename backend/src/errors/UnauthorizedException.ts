import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageApiErrorKey } from 'shared'

export class UnauthorizedException extends HttpException {
  constructor(message: LanguageApiErrorKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
    }

    super(error, HttpStatus.UNAUTHORIZED)
  }
}
