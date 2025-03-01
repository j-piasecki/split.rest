import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { SetUserDisplayNameArguments } from 'shared'

export async function setUserDisplayName(
  pool: Pool,
  callerId: string,
  args: SetUserDisplayNameArguments
) {
  if (args.displayName !== null && args.displayName.length > 128) {
    throw new BadRequestException('api.user.nameTooLong')
  } else if (args.displayName !== null && args.displayName.length === 0) {
    args.displayName = null
  }

  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  if (!(await userExists(pool, args.userId))) {
    throw new NotFoundException('api.notFound.user')
  }

  await pool.query(
    'UPDATE group_members SET display_name = $1 WHERE group_id = $2 AND user_id = $3',
    [args.displayName, args.groupId, args.userId]
  )
}
