import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { DeleteGroupJoinLinkArguments } from 'shared/src/endpointArguments'

export async function deleteGroupJoinLink(
  pool: Pool,
  callerId: string,
  args: DeleteGroupJoinLinkArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new UnauthorizedException('You do not have permission to delete a join link')
    }

    const linkExists =
      (await client.query('SELECT 1 FROM group_join_links WHERE group_id = $1', [args.groupId]))
        .rowCount > 0

    if (!linkExists) {
      throw new BadRequestException('No join link found for this group')
    }

    await client.query('DELETE FROM group_join_links WHERE group_id = $1', [args.groupId])

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
