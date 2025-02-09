import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { Pool } from 'pg'
import { SettleUpArguments, SplitInfo, SplitType } from 'shared'

export async function settleUp(
  pool: Pool,
  callerId: string,
  args: SettleUpArguments
): Promise<SplitInfo> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    if (!(await isUserMemberOfGroup(client, args.groupId, callerId))) {
      throw new NotFoundException('api.notFound.group')
    }

    const balance = Number(
      (
        await client.query<{ balance: string }>(
          `SELECT balance from group_members WHERE group_id = $1 AND user_id = $2`,
          [args.groupId, callerId]
        )
      ).rows[0].balance
    )

    if (balance === 0) {
      throw new BadRequestException('api.split.cannotSettleUpNeutral')
    }

    await client.query('COMMIT')

    // TODO: Implement the actual settle up logic

    return {
      id: Number.MAX_SAFE_INTEGER,
      version: 1,
      total: Math.abs(balance).toFixed(2),
      paidById: callerId,
      createdById: callerId,
      title: 'Settle up',
      timestamp: Date.now(),
      updatedAt: Date.now(),
      isUserParticipating: true,
      type: SplitType.SettleUp,
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
