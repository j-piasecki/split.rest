import { ConflictException } from '../../errors/ConflictException'
import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(pool: Pool, callerId: string, args: AddUserToGroupArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('notFound.group')
    }

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new ForbiddenException('insufficientPermissions.group.addUser')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('notFound.user')
    }

    if (await isUserMemberOfGroup(client, args.groupId, args.userId)) {
      throw new ConflictException('group.userAlreadyInGroup')
    }

    await client.query(
      `
        INSERT INTO group_members (
          group_id,
          user_id, 
          balance,
          is_admin,
          has_access,
          is_hidden
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [args.groupId, args.userId, 0, false, true, false]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
