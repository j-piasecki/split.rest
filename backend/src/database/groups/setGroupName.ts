import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { SetGroupNameArguments } from 'shared'

export async function setGroupName(pool: Pool, callerId: string, args: SetGroupNameArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    await client.query('UPDATE groups SET name = $1, last_update = $2 WHERE id = $3', [
      args.name,
      Date.now(),
      args.groupId,
    ])

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
