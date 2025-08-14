import { ForbiddenException } from '../../errors/ForbiddenException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupOwner } from '../utils/isUserGroupOwner'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception'
import { Pool } from 'pg'
import { SetGroupAdminArguments } from 'shared'

export async function setGroupAdmin(pool: Pool, callerId: string, args: SetGroupAdminArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('notFound.user')
    }

    if (!(await isUserMemberOfGroup(client, args.groupId, args.userId))) {
      throw new NotFoundException('api.group.userNotInGroup')
    }

    if (await isUserGroupOwner(client, args.groupId, args.userId)) {
      throw new ForbiddenException('api.insufficientPermissions.group.manageOwner')
    }

    if (args.admin) {
      const hasAccess = await client.query(
        'SELECT has_access FROM group_members WHERE group_id = $1 AND user_id = $2',
        [args.groupId, args.userId]
      )
      if (!hasAccess.rows[0].has_access) {
        throw new ForbiddenException('api.group.userWithNoAccessCannotBeMadeAdmin')
      }
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
