import { isGroupDeleted } from './utils/isGroupDeleted'
import { isUserGroupAdmin } from './utils/isUserGroupAdmin'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { SetGroupNameArguments } from 'shared'

export async function setGroupName(pool: Pool, callerId: string, args: SetGroupNameArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('Group not found')
    }

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new UnauthorizedException('You do not have permission to set the name of this group')
    }

    await client.query('UPDATE groups SET name = $1 WHERE id = $2', [args.name, args.groupId])

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
