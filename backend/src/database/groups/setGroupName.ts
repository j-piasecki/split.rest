import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupAdmin } from '../utils/isUserGroupAdmin'
import { Pool } from 'pg'
import { SetGroupNameArguments } from 'shared'

export async function setGroupName(pool: Pool, callerId: string, args: SetGroupNameArguments) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await isUserGroupAdmin(client, args.groupId, callerId))) {
      throw new ForbiddenException('api.insufficientPermissions.group.setName')
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
