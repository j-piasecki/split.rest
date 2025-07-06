import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { GetSplitParticipantsSuggestionsArguments, UserWithDisplayName } from 'shared'

export async function getSplitParticipantsSuggestions(
  pool: Pool,
  callerId: string,
  args: GetSplitParticipantsSuggestionsArguments
): Promise<UserWithDisplayName[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  const rows = (
    await pool.query(
      `
        SELECT users.id, users.name, users.email, group_members.display_name, count(split_participants.split_id)
        FROM split_participants
          INNER JOIN users on split_participants.user_id = users.id
          INNER JOIN group_members on split_participants.user_id = group_members.user_id
        WHERE
          group_members.group_id = $1
          AND users.deleted = FALSE
          AND users.id != $2
          AND split_participants.split_id IN (
            SELECT splits.id
            FROM splits
              INNER JOIN split_participants ON splits.id = split_participants.split_id
            WHERE splits.group_id = $1 AND splits.deleted = FALSE AND user_id = $2
            ORDER BY splits.timestamp DESC
            LIMIT 10
          )
        GROUP BY users.id, group_members.display_name
        ORDER BY count DESC
        LIMIT 20;
      `,
      [args.groupId, callerId]
    )
  ).rows

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: null,
    deleted: false,
    displayName: row.display_name,
  }))
}
