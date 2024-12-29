import { Pool } from 'pg'
import { SetGroupInviteIgnoredArguments } from 'shared/src/endpointArguments'

export async function setGroupInviteIgnored(
  pool: Pool,
  callerId: string,
  args: SetGroupInviteIgnoredArguments
) {
  await pool.query(
    `
      UPDATE group_invites SET ignored = $1 WHERE user_id = $2 AND group_id = $3
    `,
    [args.ignored, callerId, args.groupId]
  )
}
