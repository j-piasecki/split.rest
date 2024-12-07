import { isGroupDeleted } from './utils/isGroupDeleted'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { DeleteGroupArguments } from 'shared'

export async function deleteGroup(pool: Pool, callerId: string, args: DeleteGroupArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('Group not found')
    }

    const groupOwner = await client.query('SELECT owner FROM groups WHERE id = $1', [args.groupId])

    if (groupOwner.rows[0].owner !== callerId) {
      throw new UnauthorizedException('You do not have permission to delete this group')
    }

    await client.query('UPDATE groups SET deleted = TRUE WHERE id = $1', [args.groupId])

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
