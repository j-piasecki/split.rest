import { BadRequestException } from './errors/BadRequestException'
import { Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class MimeTypeValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes: string[]

  constructor(allowedMimeTypes: string[]) {
    this.allowedMimeTypes = allowedMimeTypes
  }

  transform(value: Express.Multer.File) {
    if (!value || !value.mimetype) {
      throw new BadRequestException('api.file.fileIsRequired')
    }

    if (!this.allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException('api.file.invalidFileType')
    }

    return value
  }
}
