import { Client, Pool, PoolClient } from 'pg'

export interface NotificationToken {
  token: string
  language: string
}

export async function getNotificationTokens(
  client: Pool | PoolClient | Client,
  userId: string
): Promise<NotificationToken[]> {
  return (
    await client.query<{ token: string; language: string }>(
      'SELECT token, language FROM notification_tokens WHERE user_id = $1 AND updated_at > $2',
      [userId, Date.now() - 1000 * 60 * 60 * 24 * 60] // Ignore tokens older than 60 days
    )
  ).rows
}
