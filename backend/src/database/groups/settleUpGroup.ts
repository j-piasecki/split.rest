import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { createSplitNoTransaction } from '../splits/createSplit'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { loadSettleUpData } from '../utils/settleUp/loadSettleUpData'
import { prepareGroupSettleUp } from '../utils/settleUp/prepareGroupSettleUp'
import { Pool } from 'pg'
import { SettleUpGroupArguments, SplitType } from 'shared'

export async function settleUpGroup(pool: Pool, callerId: string, args: SettleUpGroupArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    const settleUpData = await loadSettleUpData(client, args.groupId)
    const entries = prepareGroupSettleUp(settleUpData.members, settleUpData.pendingChanges)

    if (entries.length === 0) {
      throw new BadRequestException('api.group.settledUpButPending')
    }

    // TODO

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
