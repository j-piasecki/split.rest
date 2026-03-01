import { Base64ImageValidation } from './Base64ImageValidation'
import { BadRequestException } from './errors/BadRequestException'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import * as tf from '@tensorflow/tfjs-node'
import * as fs from 'fs'
import * as nsfwjs from 'nsfwjs'
import { dirname } from 'path'
import { FileUploadArguments } from 'shared'
import sharp from 'sharp'

tf.enableProdMode()

@Injectable()
export class ImageService {
  private s3Client: S3Client
  private nsfwjsModel: nsfwjs.NSFWJS

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })

    nsfwjs.load('MobileNetV2').then((model) => {
      this.nsfwjsModel = model
    })
  }

  async argumentsToImageBuffer(
    args: FileUploadArguments,
    file?: Express.Multer.File,
    options: {
      maxSizeKb?: number
      allowedMimeTypes?: string[]
      dimensions?: {
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        aspectRatio?: number
      }
    } = {}
  ) {
    let imageBuffer: Buffer

    if (file) {
      imageBuffer = file.buffer
    } else if (args.file.uri && args.file.type) {
      const validatedBase64 = await new Base64ImageValidation({
        maxSizeKb: options.maxSizeKb ?? 20,
        allowedMimeTypes: options.allowedMimeTypes ?? ['image/png', 'image/jpeg', 'image/jpg'],
        dimensions: options.dimensions,
      }).transform({
        imageBase64: args.file.uri,
        imageType: args.file.type,
      })
      imageBuffer = validatedBase64.buffer
    } else {
      throw new BadRequestException('api.file.fileIsRequired')
    }

    return imageBuffer
  }

  async saveImageToFile(
    imageBuffer: Buffer,
    path: string,
    options: {
      resize?: {
        width?: number
        height?: number
      }
    } = {}
  ) {
    const dir = dirname(path)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    await sharp(imageBuffer)
      .resize(options.resize?.width ?? 128, options.resize?.height ?? 128)
      .toFormat('jpg', { quality: 80 })
      .toFile(path)
  }

  async invalidateCache(path: string) {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_CACHE_PURGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [`https://assets.split.rest/${path}`],
        }),
      }
    )
  }

  async ensureImageIsNotNSFW(imageBuffer: Buffer) {
    const image = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D
    const predictions = await this.nsfwjsModel.classify(image)
    image.dispose()

    if (
      predictions[0].className === 'Porn' ||
      predictions[0].className === 'Hentai' ||
      predictions
        .map((p) => ({ ...p, probability: p.probability / predictions[0].probability }))
        .filter((p) => p.className === 'Porn' || p.className === 'Hentai')
        .some((p) => p.probability > 0.7)
    ) {
      throw new BadRequestException('api.file.nsfwImage')
    }
  }

  async downloadProfilePicture(url: string, id: string) {
    const photo = await fetch(url)
    const buffer = await photo.arrayBuffer()
    await sharp(Buffer.from(buffer))
      .resize(128, 128)
      .toFormat('jpg', { quality: 80 })
      .toFile(`public/${id}.jpg`)
  }

  async downloadProfilePictureToBase64(url: string, id: string) {
    const photo = await fetch(url)
    const contentType = photo.headers.get('content-type')
    const buffer = await photo.arrayBuffer()

    if (!fs.existsSync(`public/${id}.jpg`)) {
      fs.writeFileSync(`public/${id}.jpg`, Buffer.from(buffer))
    }

    return 'data:' + contentType + ';base64,' + Buffer.from(buffer).toString('base64')
  }

  async deleteProfilePicture(id: string) {
    fs.unlinkSync(`public/${id}.jpg`)
  }

  async uploadProfilePictureToR2(id: string) {
    const file = fs.readFileSync(`public/${id}.jpg`)
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `profile-pictures/${id}.jpg`,
      Body: file,
      ContentType: 'image/jpg',
    })
    await this.s3Client.send(uploadCommand)
  }

  async deleteProfilePictureFromR2(id: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `profile-pictures/${id}.jpg`,
    })
    await this.s3Client.send(deleteCommand)
  }

  async deleteGroupIcon(id: string) {
    fs.unlinkSync(`public/groupIcon/${id}.jpg`)
  }

  async uploadGroupIconToR2(id: string) {
    const file = fs.readFileSync(`public/groupIcon/${id}.jpg`)
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `group-icons/${id}.jpg`,
      Body: file,
      ContentType: 'image/jpg',
    })
    await this.s3Client.send(uploadCommand)
  }

  async deleteGroupIconFromR2(id: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `group-icons/${id}.jpg`,
    })
    await this.s3Client.send(deleteCommand)
  }
}
