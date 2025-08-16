import { ImageDimensionsOptions } from './ImageDimensionsValidationPipe'
import { BadRequestException } from './errors/BadRequestException'
import sharp from 'sharp'

export interface Base64ImageValidationOptions {
  maxSizeKb: number
  allowedMimeTypes: string[]
  dimensions?: ImageDimensionsOptions
}

export class Base64ImageValidation {
  constructor(private readonly options: Base64ImageValidationOptions) {}

  async transform(value: {
    imageBase64?: string
    imageType?: string
  }): Promise<{ imageBase64: string; imageType: string; buffer: Buffer }> {
    if (!value.imageBase64 || !value.imageType) {
      throw new BadRequestException('api.file.fileIsRequired')
    }

    // Validate MIME type
    if (!this.options.allowedMimeTypes.includes(value.imageType)) {
      throw new BadRequestException('api.file.invalidFileType')
    }

    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = value.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64')

      // Validate file size
      const sizeKb = buffer.length / 1000
      if (sizeKb > this.options.maxSizeKb) {
        throw new BadRequestException('api.file.fileSizeExceedsMaximumAllowedSize')
      }

      // Validate image dimensions if options provided
      if (this.options.dimensions) {
        const metadata = await sharp(buffer).metadata()
        const { width, height } = metadata

        if (!width || !height) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        const dims = this.options.dimensions

        // Check exact dimensions
        if (dims.exactWidth && width !== dims.exactWidth) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        if (dims.exactHeight && height !== dims.exactHeight) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        // Check maximum dimensions
        if (dims.maxWidth && width > dims.maxWidth) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        if (dims.maxHeight && height > dims.maxHeight) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        // Check minimum dimensions
        if (dims.minWidth && width < dims.minWidth) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        if (dims.minHeight && height < dims.minHeight) {
          throw new BadRequestException('api.file.invalidImageDimensions')
        }

        // Check aspect ratio
        if (dims.aspectRatio) {
          const actualRatio = width / height
          const tolerance = 0.01 // Allow small tolerance for floating point comparison

          if (Math.abs(actualRatio - dims.aspectRatio) > tolerance) {
            throw new BadRequestException('api.file.invalidImageDimensions')
          }
        }
      }

      return {
        imageBase64: value.imageBase64,
        imageType: value.imageType,
        buffer,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('api.file.invalidImageDimensions')
    }
  }
}
