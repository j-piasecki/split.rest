import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
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
      [groupId, callerId, 0, false, true, false]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
