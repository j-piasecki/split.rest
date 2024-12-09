import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { UnauthorizedException } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
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
      throw new NotFoundException('Invalid join link')
    }

    if (await isGroupDeleted(pool, groupId)) {
      throw new NotFoundException('Group not found')
    }

    if (!(await isUserMemberOfGroup(pool, groupId, callerId))) {
      throw new UnauthorizedException('You are not a member of this group')
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
