import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGroupOwner } from '../utils/isUserGroupOwner'
import { Pool } from 'pg'
import { DeleteGroupArguments } from 'shared'

export async function deleteGroup(pool: Pool, callerId: string, args: DeleteGroupArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await isUserGroupOwner(client, args.groupId, callerId))) {
      throw new ForbiddenException('api.insufficientPermissions.group.delete')
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
