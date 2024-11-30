import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import { AddUserToGroupArguments } from 'shared'

export async function addUserToGroup(pool: Pool, callerId: string, args: AddUserToGroupArguments) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const isCallerAdmin = (
      await client.query(
        'SELECT is_admin FROM group_members WHERE group_id = $1 AND user_id = $2',
        [args.groupId, callerId]
      )
    ).rows[0]?.is_admin

    if (!isCallerAdmin) {
      throw new UnauthorizedException('You do not have permission to add users to this group')
    }

    const userExists = (await client.query('SELECT 1 FROM users WHERE id = $1', [args.userId]))
      .rowCount

    if (!userExists) {
      throw new NotFoundException('User not found')
    }

    const userAlreadyAMember = (
      await client.query('SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2', [
        args.groupId,
        args.userId,
      ])
    ).rowCount

    if (userAlreadyAMember) {
      throw new ConflictException('User is already a member of the group')
    }

    await client.query(
      'INSERT INTO group_members (group_id, user_id, balance, is_admin, has_access, is_hidden) VALUES ($1, $2, $3, $4, $5, $6)',
      [args.groupId, args.userId, 0, false, true, false]
    )

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
