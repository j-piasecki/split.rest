import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { addUserToGroup } from '../utils/addUserToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { Pool } from 'pg'
import { AcceptGroupInviteArguments } from 'shared/src/endpointArguments'

export async function acceptGroupInvite(
  pool: Pool,
  callerId: string,
  args: AcceptGroupInviteArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const inviteInfo = (
      await client.query<{
        created_by: string
      }>(
        `
        SELECT created_by FROM group_invites WHERE user_id = $1 AND group_id = $2 and withdrawn = FALSE
      `,
        [callerId, args.groupId]
      )
    ).rows[0]

    if (!inviteInfo) {
      throw new NotFoundException('api.notFound.invite')
    }

    if (await isGroupDeleted(pool, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isUserMemberOfGroup(pool, args.groupId, callerId)) {
      throw new ConflictException('api.group.callerAlreadyInGroup')
    }

    await client.query(
      `
        DELETE FROM group_invites WHERE user_id = $1 AND group_id = $2
      `,
      [callerId, args.groupId]
    )

    await addUserToGroup(client, {
      groupId: args.groupId,
      userId: callerId,
      invitedBy: inviteInfo.created_by,
    })

    await client.query(
      `
        UPDATE groups SET member_count = member_count + 1 WHERE id = $1
      `,
      [args.groupId]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
