import { ForbiddenException } from '../../errors/ForbiddenException'
import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { SetGroupInviteWithdrawnArguments } from 'shared/src/endpointArguments'

export async function setGroupInviteWithdrawn(
  pool: Pool,
  callerId: string,
  args: SetGroupInviteWithdrawnArguments
) {
  const invite = await pool.query(
    `
      SELECT created_by FROM group_invites WHERE user_id = $1 AND group_id = $2
    `,
    [args.userId, args.groupId]
  )

  if (!invite?.rowCount) {
    throw new NotFoundException('api.notFound.invite')
  }

  if (args.onlyIfCreated && invite.rows[0].created_by !== callerId) {
    throw new ForbiddenException('api.insufficientPermissions.group.manageDirectInvites')
  }

  await pool.query(
    `
      UPDATE group_invites SET withdrawn = $1 WHERE user_id = $2 AND group_id = $3
    `,
    [args.withdrawn, args.userId, args.groupId]
  )
}
