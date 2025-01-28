import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { SetGroupInviteWithdrawnArguments } from 'shared/src/endpointArguments'

export async function setGroupInviteWithdrawn(
  pool: Pool,
  callerId: string,
  args: SetGroupInviteWithdrawnArguments
) {
  const inviteExists =
    (
      await pool.query(
        `
        SELECT 1 FROM group_invites WHERE user_id = $1 AND group_id = $2
      `,
        [args.userId, args.groupId]
      )
    ).rowCount === 1

  if (!inviteExists) {
    throw new NotFoundException('api.notFound.invite')
  }

  await pool.query(
    `
      UPDATE group_invites SET withdrawn = $1 WHERE user_id = $2 AND group_id = $3
    `,
    [args.withdrawn, args.userId, args.groupId]
  )
}
