import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { SetAllowedSplitMethodsArguments, SplitMethod, validateAllowedSplitMethods } from 'shared'

export async function setGroupAllowedSplitMethods(
  pool: Pool,
  callerId: string,
  args: SetAllowedSplitMethodsArguments
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    const error = validateAllowedSplitMethods(args.allowedSplitMethods)
    if (error) {
      throw new BadRequestException(error)
    }

    await client.query(
      `
        UPDATE group_settings
        SET split_equally_enabled = $1,
          split_exact_enabled = $2,
          split_shares_enabled = $3,
          split_balance_changes_enabled = $4,
          split_lend_enabled = $5,
          split_delayed_enabled = $6
        WHERE group_id = $7
      `,
      [
        args.allowedSplitMethods.includes(SplitMethod.Equal),
        args.allowedSplitMethods.includes(SplitMethod.ExactAmounts),
        false,
        args.allowedSplitMethods.includes(SplitMethod.BalanceChanges),
        args.allowedSplitMethods.includes(SplitMethod.Lend),
        args.allowedSplitMethods.includes(SplitMethod.Delayed),
        args.groupId,
      ]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
