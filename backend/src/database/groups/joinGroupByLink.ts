import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { addUserToGroup } from '../utils/addUserToGroup'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { Pool } from 'pg'
import { JoinGroupByLinkArguments } from 'shared/src/endpointArguments'

export async function joinGroupByLink(
  pool: Pool,
  callerId: string,
  args: JoinGroupByLinkArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const linkData = (
      await client.query<{
        group_id: number
        created_by: string
      }>('SELECT group_id, created_by FROM group_join_links WHERE uuid = $1', [args.uuid])
    ).rows[0]

    if (!linkData) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isGroupDeleted(pool, linkData.group_id)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isUserMemberOfGroup(pool, linkData.group_id, callerId)) {
      throw new ConflictException('api.group.callerAlreadyInGroup')
    }

    await addUserToGroup(client, {
      groupId: linkData.group_id,
      userId: callerId,
      invitedBy: linkData.created_by,
    })

    await client.query(
      `
        UPDATE groups SET member_count = member_count + 1 WHERE id = $1
      `,
      [linkData.group_id]
    )

    await client.query(
      `
        DELETE FROM group_invites WHERE user_id = $1 AND group_id = $2
      `,
      [callerId, linkData.group_id]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
