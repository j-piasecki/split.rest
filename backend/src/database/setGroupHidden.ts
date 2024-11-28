import { Pool } from 'pg'
import { SetGroupHiddenArguments } from 'shared'

export async function setGroupHidden(pool: Pool, callerId: string, args: SetGroupHiddenArguments) {
  await pool.query('UPDATE group_members SET is_hidden = $1 WHERE group_id = $2 AND user_id = $3', [
    args.hidden,
    args.groupId,
    callerId,
  ])
}
