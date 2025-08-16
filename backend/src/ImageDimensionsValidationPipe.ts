import { BadRequestException } from './errors/BadRequestException'
import { Injectable, PipeTransform } from '@nestjs/common'
import sharp from 'sharp'

export interface ImageDimensionsOptions {
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
  exactWidth?: number
  exactHeight?: number
  aspectRatio?: number // width/height ratio
}

@Injectable()
export class ImageDimensionsValidationPipe implements PipeTransform {
  private readonly options: ImageDimensionsOptions

  constructor(options: ImageDimensionsOptions) {
    this.options = options
  }

  async transform(value?: Express.Multer.File) {
    if (!value) {
      return value
    }

    try {
      const metadata = await sharp(value.buffer).metadata()
      const { width, height } = metadata

      if (!width || !height) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      // Check exact dimensions
      if (this.options.exactWidth && width !== this.options.exactWidth) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      if (this.options.exactHeight && height !== this.options.exactHeight) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      // Check maximum dimensions
      if (this.options.maxWidth && width > this.options.maxWidth) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      if (this.options.maxHeight && height > this.options.maxHeight) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      // Check minimum dimensions
      if (this.options.minWidth && width < this.options.minWidth) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      if (this.options.minHeight && height < this.options.minHeight) {
        throw new BadRequestException('api.file.invalidImageDimensions')
      }

      // Check aspect ratio
      if (this.options.aspectRatio) {
        const actualRatio = width / height
        const tolerance = 0.01 // Allow small tolerance for floating point comparison

        if (Math.abs(actualRatio - this.options.aspectRatio) > tolerance) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }
      }

      return value
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('api.file.invalidImageDimensions')
    }
  }
}
