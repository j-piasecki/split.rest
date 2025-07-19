import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { SetGroupLockedArguments } from 'shared'

export async function setGroupLocked(pool: Pool, callerId: string, args: SetGroupLockedArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    await client.query('UPDATE groups SET locked = $1 WHERE id = $2', [args.locked, args.groupId])

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
