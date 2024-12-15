import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(pool: Pool, callerId: string, args: AddUserToGroupArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('api.notFound.user')
    }

    if (await isUserMemberOfGroup(client, args.groupId, args.userId)) {
      throw new ConflictException('api.group.userAlreadyInGroup')
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

    await client.query(
      `
        UPDATE groups SET member_count = member_count + 1 WHERE id = $1
      `,
      [args.groupId]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
