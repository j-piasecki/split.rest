import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { userExists } from '../utils/userExists'
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception'
import { Pool } from 'pg'
import { SetGroupAdminArguments } from 'shared'
import { ForbiddenException } from 'src/errors/ForbiddenException'

export async function setGroupAdmin(pool: Pool, callerId: string, args: SetGroupAdminArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('notFound.group')
    }

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new ForbiddenException('insufficientPermissions.group.setAdmin')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('notFound.user')
    }

    await client.query(
      'UPDATE group_members SET is_admin = $1 WHERE group_id = $2 AND user_id = $3',
      [args.admin, args.groupId, args.userId]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
