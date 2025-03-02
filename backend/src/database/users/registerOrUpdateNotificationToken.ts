import { Pool } from 'pg'
import { RegisterOrUpdateNotificationTokenArguments } from 'shared'

export async function registerOrUpdateNotificationToken(
  pool: Pool,
  callerId: string,
  args: RegisterOrUpdateNotificationTokenArguments
) {
  await pool.query(
    `
      INSERT INTO notification_tokens(user_id, token, language, updated_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, token) DO UPDATE
      SET language = $3, updated_at = $4
    `,
    [callerId, args.token, args.language, Date.now()]
  )
}
