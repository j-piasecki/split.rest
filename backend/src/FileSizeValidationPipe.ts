import { BadRequestException } from './errors/BadRequestException'
import { Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly maxSize: number
  constructor(maxSizeKb: number) {
    this.maxSize = maxSizeKb * 1000
  }

  transform(value?: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('api.file.fileIsRequired')
    }

    if (value.size >= this.maxSize) {
      throw new BadRequestException('api.file.fileSizeExceedsMaximumAllowedSize')
    }
    return value
  }
}
