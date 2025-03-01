import { NotFoundException } from '../../errors/NotFoundException'
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

    const linkExists =
      ((await client.query('SELECT 1 FROM group_join_links WHERE group_id = $1', [args.groupId]))
        .rowCount ?? 0) > 0

    if (!linkExists) {
      throw new NotFoundException('api.notFound.joinLink')
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
