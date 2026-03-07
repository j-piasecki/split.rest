import { ConflictException } from '../../errors/ConflictException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { isUserMemberOfGroup } from '../utils/isUserMemberOfGroup'
import { Pool } from 'pg'
import { ClaimGhostUserArguments } from 'shared'

export async function claimGhostUser(
  pool: Pool,
  callerId: string,
  args: ClaimGhostUserArguments
): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Look up the ghost user by claim code
    const ghostRes = await client.query(
      `
      SELECT id, group_id
      FROM ghost_users
      WHERE claim_code = $1
      FOR UPDATE
      `,
      [args.claimCode]
    )

    if (ghostRes.rows.length === 0) {
      throw new NotFoundException('api.group.invalidClaimCode')
    }

    const ghostId = ghostRes.rows[0].id
    const groupId = ghostRes.rows[0].group_id

    if (await isGroupDeleted(client, groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    // 2. Prevent claiming if the caller is already a member of this group
    if (await isUserMemberOfGroup(client, groupId, callerId)) {
      throw new ConflictException('api.group.callerAlreadyInGroup')
    }

    // 3. Sequentially UPDATE all child tables safely mapping ghostId to callerId
    // We update ONLY the rows for the specific group_id to ensure we do not touch rows belonging to other groups if the ghost was somehow reused (though it shouldn't be based on the model).

    // group_members (user_id)
    // Lock the row first to prevent concurrent deletion racing the claim
    const lockRes = await client.query(
      `
      SELECT 1
      FROM group_members
      WHERE group_id = $1 AND user_id = $2
      FOR UPDATE
      `,
      [groupId, ghostId]
    )

    if (lockRes.rowCount === 0) {
      throw new NotFoundException('api.group.userNotInGroup')
    }

    await client.query(
      `
      UPDATE group_members
      SET user_id = $1
      WHERE group_id = $2 AND user_id = $3
      `,
      [callerId, groupId, ghostId]
    )

    // splits (paid_by, created_by, deleted_by)
    await client.query(
      `
      UPDATE splits
      SET paid_by = $1
      WHERE group_id = $2 AND paid_by = $3
      `,
      [callerId, groupId, ghostId]
    )

    await client.query(
      `
      UPDATE splits
      SET created_by = $1
      WHERE group_id = $2 AND created_by = $3
      `,
      [callerId, groupId, ghostId]
    )

    await client.query(
      `
      UPDATE splits
      SET deleted_by = $1
      WHERE group_id = $2 AND deleted_by = $3
      `,
      [callerId, groupId, ghostId]
    )

    // split_edits (paid_by, created_by)
    await client.query(
      `
      UPDATE split_edits
      SET paid_by = $1
      WHERE group_id = $2 AND paid_by = $3
      `,
      [callerId, groupId, ghostId]
    )

    await client.query(
      `
      UPDATE split_edits
      SET created_by = $1
      WHERE group_id = $2 AND created_by = $3
      `,
      [callerId, groupId, ghostId]
    )

    // split_participants (user_id)
    // Needs a join to filter by group_id
    await client.query(
      `
      UPDATE split_participants
      SET user_id = $1
      FROM splits
      WHERE split_participants.split_id = splits.id
        AND splits.group_id = $2 
        AND split_participants.user_id = $3
      `,
      [callerId, groupId, ghostId]
    )

    // split_participants_edits (user_id)
    await client.query(
      `
      UPDATE split_participants_edits
      SET user_id = $1
      FROM splits
      WHERE split_participants_edits.split_id = splits.id
        AND splits.group_id = $2 
        AND split_participants_edits.user_id = $3
      `,
      [callerId, groupId, ghostId]
    )

    // 4. Safely detach and delete the ghost user
    await client.query(
      `
      DELETE FROM ghost_users
      WHERE id = $1
      `,
      [ghostId]
    )

    await client.query(
      `
      DELETE FROM users
      WHERE id = $1 AND is_ghost = TRUE
      `,
      [ghostId]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
