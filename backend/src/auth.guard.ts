import { UnauthorizedException } from './errors/UnauthorizedException'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'

const CERTIFICATE_LIFETIME = 1000 * 60 * 30

declare module 'express' {
  interface Request {
    user: jwt.JwtPayload
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private certificates: Record<string, string> | null = null
  private certificatesRefreshedAt = 0

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('api.auth.missingToken')
    }

    const tokenData = jwt.decode(token, { complete: true })
    const certificates = await this.getTokenCertificates()

    if (!tokenData) {
      throw new UnauthorizedException('api.auth.invalidToken')
    }

    jwt.verify(
      token,
      certificates[tokenData.header.kid],
      { algorithms: [tokenData.header.alg as jwt.Algorithm] },
      (err, decoded: jwt.JwtPayload) => {
        if (err) {
          throw new UnauthorizedException('api.auth.expiredToken')
        }

        if (
          decoded.aud !== 'split-6ed94' ||
          decoded.iss !== 'https://securetoken.google.com/split-6ed94'
        ) {
          throw new UnauthorizedException('api.auth.invalidToken')
        }

        request['user'] = decoded
      }
    )

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }

  private async getTokenCertificates() {
    if (!this.certificates || Date.now() - this.certificatesRefreshedAt > CERTIFICATE_LIFETIME) {
      const response = await fetch(
        'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
      )
      const data = await response.json()

      this.certificates = data
      this.certificatesRefreshedAt = Date.now()

      return data
    } else {
      return this.certificates
    }
  }
}
