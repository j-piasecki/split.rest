import { Client, Pool, PoolClient } from 'pg'

export async function addUserToGroup(
  client: Pool | PoolClient | Client,
  data: {
    groupId: number
    userId: string
    isAdmin?: boolean
    invitedBy: string
  }
) {
  await client.query(
    `
      INSERT INTO group_members (
        group_id,
        user_id, 
        balance,
        is_admin,
        has_access,
        is_hidden,
        joined_at,
        invited_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [data.groupId, data.userId, 0, data.isAdmin ?? false, true, false, Date.now(), data.invitedBy]
  )
}
