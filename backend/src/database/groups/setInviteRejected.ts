import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { SetGroupInviteRejectedArguments } from 'shared/src/endpointArguments'

export async function setGroupInviteRejected(
  pool: Pool,
  callerId: string,
  args: SetGroupInviteRejectedArguments
) {
  const inviteExists =
    (
      await pool.query(
        `
        SELECT 1 FROM group_invites WHERE user_id = $1 AND group_id = $2 and withdrawn = FALSE
      `,
        [callerId, args.groupId]
      )
    ).rowCount === 1

  if (!inviteExists) {
    throw new NotFoundException('api.notFound.invite')
  }

  await pool.query(
    `
      UPDATE group_invites SET rejected = $1 WHERE user_id = $2 AND group_id = $3
    `,
    [args.rejected, callerId, args.groupId]
  )
}
