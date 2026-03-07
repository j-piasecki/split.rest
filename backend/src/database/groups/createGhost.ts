import { BadRequestException } from '../../errors/BadRequestException'
import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import * as crypto from 'crypto'
import { Pool } from 'pg'
import { CreateGhostArguments, Member } from 'shared'

export async function createGhost(
  pool: Pool,
  callerId: string,
  args: CreateGhostArguments
): Promise<Member> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const name = args.name.trim()

    if (name.length > 128) {
      throw new BadRequestException('api.user.nameTooLong')
    } else if (name.length === 0) {
      throw new BadRequestException('api.user.nameCannotBeEmpty')
    }

    if (await isGroupDeleted(client, args.groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    // Generate a new UUID for the logical ghost user (32 characters)
    const ghostId = crypto.randomUUID().replace(/-/g, '')
    const now = Date.now()

    // Create the user record
    await client.query(
      `
        INSERT INTO users (id, name, created_at, photo_url, is_ghost)
        VALUES ($1, $2, $3, NULL, TRUE)
      `,
      [ghostId, name, now]
    )

    // Create the ghost_users record
    await client.query(
      `
        INSERT INTO ghost_users (id, group_id, is_ghost, created_by, claim_code)
        VALUES ($1, $2, TRUE, $3, NULL)
      `,
      [ghostId, args.groupId, callerId]
    )

    // Add ghost to the group
    await client.query(
      `
        INSERT INTO group_members (group_id, user_id, has_access, is_admin, is_hidden, balance, joined_at, invited_by)
        VALUES ($1, $2, TRUE, FALSE, FALSE, 0, $3, $4)
      `,
      [args.groupId, ghostId, now, callerId]
    )

    // Update group member count
    await client.query(
      `
        UPDATE groups SET member_count = member_count + 1 WHERE id = $1
      `,
      [args.groupId]
    )

    await client.query('COMMIT')

    return {
      id: ghostId,
      name: name,
      email: null,
      pictureId: null,
      balance: '0.00',
      hasAccess: true,
      isAdmin: false,
      deleted: false,
      isGhost: true,
      displayName: null,
    }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
