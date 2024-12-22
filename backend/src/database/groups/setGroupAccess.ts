import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupOwner } from '../utils/isUserGroupOwner'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { SetGroupAccessArguments } from 'shared'

export async function setGroupAccess(pool: Pool, callerId: string, args: SetGroupAccessArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('api.notFound.user')
    }

    if (await isUserGroupOwner(client, args.groupId, args.userId)) {
      throw new ForbiddenException('api.insufficientPermissions.group.manageOwner')
    }

    if (args.access) {
      await client.query(
        'UPDATE group_members SET has_access = $1 WHERE group_id = $2 AND user_id = $3',
        [args.access, args.groupId, args.userId]
      )
    } else {
      await client.query(
        'UPDATE group_members SET has_access = $1, is_admin = false WHERE group_id = $2 AND user_id = $3',
        [args.access, args.groupId, args.userId]
      )
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
