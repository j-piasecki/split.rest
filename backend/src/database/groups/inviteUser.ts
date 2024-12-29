import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { InviteUserToGroupArguments } from 'shared'

export async function inviteUser(pool: Pool, callerId: string, args: InviteUserToGroupArguments) {
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
        INSERT INTO group_invites (group_id, user_id, created_by, created_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (group_id, user_id) DO UPDATE SET created_by = $3, created_at = $4, ignored = FALSE
      `,
      [args.groupId, args.userId, callerId, Date.now()]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
