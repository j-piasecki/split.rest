import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGhost } from '../utils/isUserGhost'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import { Pool } from 'pg'
import { DeleteGhostClaimCodeArguments } from 'shared'

export async function deleteGhostClaimCode(
  pool: Pool,
  callerId: string,
  args: DeleteGhostClaimCodeArguments
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await userExists(client, args.memberId))) {
      throw new NotFoundException('api.notFound.user')
    }

    if (!(await isUserMemberOfGroup(client, args.groupId, args.memberId))) {
      throw new NotFoundException('api.group.userNotInGroup')
    }

    if (!(await isUserGhost(client, args.memberId))) {
      throw new ForbiddenException('api.group.notAGhost')
    }

    const result = await client.query(
      `
      UPDATE ghost_users
      SET claim_code = NULL
      WHERE id = $1 AND group_id = $2
      `,
      [args.memberId, args.groupId]
    )

    if (result.rowCount === 0) {
      throw new NotFoundException('api.notFound.user')
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
