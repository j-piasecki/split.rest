import { TargetedBalanceChange } from './types'
import pg from 'pg'
import { Member } from 'shared'

export async function loadSettleUpData(client: pg.Client | pg.PoolClient, groupId: number) {
  const members: Member[] = (
    await client.query(
      `
        SELECT 
          users.id,
          users.name,
          users.email, 
          users.deleted,
          group_members.balance,
          group_members.has_access,
          group_members.is_admin,
          group_members.display_name
        FROM group_members 
        JOIN users ON group_members.user_id = users.id 
        WHERE group_id = $1 
        ORDER BY users.id 
      `,
      [groupId]
    )
  ).rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    deleted: row.deleted,
    balance: row.balance,
    hasAccess: row.has_access,
    isAdmin: row.is_admin,
    displayName: row.display_name,
  }))

  const pendingChanges: TargetedBalanceChange[] = (
    await client.query(
      `
        SELECT 
          user_id,
          change,
          pending,
          splits.paid_by AS target_user_id
        FROM split_participants INNER JOIN splits ON split_participants.split_id = splits.id
        WHERE group_id = $1 AND pending = TRUE AND deleted = FALSE
      `,
      [groupId]
    )
  ).rows.map((row) => ({
    id: row.user_id,
    targetId: row.target_user_id,
    change: row.change,
    pending: row.pending,
  }))

  const currency = (await client.query(`SELECT currency FROM groups WHERE id = $1`, [groupId]))
    .rows[0].currency

  return {
    members: members,
    pendingChanges: pendingChanges,
    currency: currency,
  }
}
