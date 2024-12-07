import { isGroupDeleted } from '../utils/isGroupDeleted'
import { NotFoundException } from '@nestjs/common'
import { Pool } from 'pg'
import { SetGroupHiddenArguments } from 'shared'

export async function setGroupHidden(pool: Pool, callerId: string, args: SetGroupHiddenArguments) {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('Group not found')
  }

  await pool.query('UPDATE group_members SET is_hidden = $1 WHERE group_id = $2 AND user_id = $3', [
    args.hidden,
    args.groupId,
    callerId,
  ])
}
