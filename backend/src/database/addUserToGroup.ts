import { isGroupDeleted } from './utils/isGroupDeleted'
import { isUserGroupAdmin } from './utils/isUserGroupAdmin'
import { isUserMemberOfGroup } from './utils/isUserMemberOfGroup'
import { userExists } from './utils/userExists'
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(pool: Pool, callerId: string, args: AddUserToGroupArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('Group not found')
    }

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new UnauthorizedException('You do not have permission to add users to this group')
    }

    if (!(await userExists(client, args.userId))) {
      throw new NotFoundException('User not found')
    }

    if (await isUserMemberOfGroup(client, args.groupId, args.userId)) {
      throw new ConflictException('User is already a member of the group')
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
