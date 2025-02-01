import { BadRequestException } from '../../errors/BadRequestException'
import { Pool } from 'pg'
import { SetUserNameArguments } from 'shared'

export async function setUserName(pool: Pool, callerId: string, args: SetUserNameArguments) {
  if (args.name.length > 128) {
    throw new BadRequestException('api.user.nameTooLong')
  } else if (args.name.length === 0) {
    throw new BadRequestException('api.user.nameCannotBeEmpty')
  }

  await pool.query('UPDATE users SET name = $1 WHERE id = $2', [args.name, callerId])
}
