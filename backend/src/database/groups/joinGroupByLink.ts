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

    const groupId = (
      await client.query('SELECT group_id FROM group_join_links WHERE uuid = $1', [args.uuid])
    ).rows[0]?.group_id

    if (!groupId) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isGroupDeleted(pool, groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (await isUserMemberOfGroup(pool, groupId, callerId)) {
      throw new ConflictException('api.group.userAlreadyInGroup')
    }

    await addUserToGroup(client, { groupId, userId: callerId })

    await client.query(
      `
        UPDATE groups SET member_count = member_count + 1 WHERE id = $1
      `,
      [groupId]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
