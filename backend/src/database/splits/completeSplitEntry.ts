import { NotFoundException } from '../../errors/NotFoundException'
import { splitExists } from '../utils/splitExists'
import { Pool } from 'pg'
import { CompleteSplitEntryArguments } from 'shared'

export async function completeSplitEntry(
  pool: Pool,
  callerId: string,
  args: CompleteSplitEntryArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (!(await splitExists(client, args.groupId, args.splitId))) {
      throw new NotFoundException('api.notFound.split')
    }

    // TODO: Implement the logic to complete the split entry
    console.log('Completing split entry:', args.splitId)

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
