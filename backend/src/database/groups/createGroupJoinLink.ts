import { BadRequestException } from '../../errors/BadRequestException'
import crypto from 'crypto'
import { Pool } from 'pg'
import { CreateGroupJoinLinkArguments } from 'shared/src/endpointArguments'
import { GroupJoinLink } from 'shared/src/types'

export async function createGroupJoinLink(
  pool: Pool,
  callerId: string,
  args: CreateGroupJoinLinkArguments
): Promise<GroupJoinLink> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const linkExists =
      ((await client.query('SELECT 1 FROM group_join_links WHERE group_id = $1', [args.groupId]))
        .rowCount ?? 0) > 0

    if (linkExists) {
      throw new BadRequestException('api.group.joinLinkAlreadyExists')
    }

    const uuid = crypto.randomUUID()
    const createdAt = Date.now()

    await client.query(
      'INSERT INTO group_join_links (uuid, group_id, created_by, created_at) VALUES ($1, $2, $3, $4)',
      [uuid, args.groupId, callerId, createdAt]
    )

    await client.query('COMMIT')

    return {
      uuid: uuid,
      groupId: args.groupId,
      createdById: callerId,
      createdAt: createdAt,
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
