import { Pool } from 'pg'
import { SetGroupInviteRejectedArguments } from 'shared/src/endpointArguments'

export async function setGroupInviteRejected(
  pool: Pool,
  callerId: string,
  args: SetGroupInviteRejectedArguments
) {
  await pool.query(
    `
      UPDATE group_invites SET rejected = $1 WHERE user_id = $2 AND group_id = $3
    `,
    [args.rejected, callerId, args.groupId]
  )
}
