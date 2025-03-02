import { Pool } from 'pg'
import { UnregisterNotificationTokenArguments } from 'shared'

export async function unregisterNotificationToken(
  pool: Pool,
  callerId: string,
  args: UnregisterNotificationTokenArguments
) {
  await pool.query(
    `
      DELETE FROM notification_tokens
      WHERE user_id = $1 AND token = $2
    `,
    [callerId, args.token]
  )
}
