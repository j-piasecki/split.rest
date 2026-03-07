import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserGhost } from '../utils/isUserGhost'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { userExists } from '../utils/userExists'
import * as crypto from 'crypto'
import { Pool } from 'pg'
import { CreateGhostClaimCodeArguments, GhostClaimCode } from 'shared'

export async function createGhostClaimCode(
  pool: Pool,
  callerId: string,
  args: CreateGhostClaimCodeArguments
): Promise<GhostClaimCode> {
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

    const claimCode = crypto.randomUUID()

    await client.query(
      `
      UPDATE ghost_users
      SET claim_code = $1, code_created_at = $2
      WHERE id = $3 AND group_id = $4
      `,
      [claimCode, Date.now(), args.memberId, args.groupId]
    )

    await client.query('COMMIT')

    return { claimCode }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
