import { Injectable } from '@nestjs/common'

@Injectable()
export class DatabaseService {
  constructor() {
    console.log('DatabaseService instantiated')
  }

  test() {
    return 'test'
  }
}
