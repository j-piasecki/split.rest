import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageApiErrorKey } from 'shared'

export class BadRequestException extends HttpException {
  constructor(message: LanguageApiErrorKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad request',
    }

    super(error, HttpStatus.BAD_REQUEST)
  }
}
