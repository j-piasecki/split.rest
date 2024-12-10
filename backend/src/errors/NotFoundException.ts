import { HttpException, HttpStatus } from '@nestjs/common'
import { ApiErrorPayload, LanguageApiErrorKey } from 'shared'

export class NotFoundException extends HttpException {
  constructor(message: LanguageApiErrorKey) {
    const error: ApiErrorPayload = {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'Not found',
    }

    super(error, HttpStatus.NOT_FOUND)
  }
}
