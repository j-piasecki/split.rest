import { NotFoundException } from '../../errors/NotFoundException'
import { ImageService } from '../../image.service'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import crypto from 'crypto'
import { Pool } from 'pg'

export async function setGroupIcon(
  pool: Pool,
  imageService: ImageService,
  callerId: string,
  groupId: number,
  buffer: Buffer
) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (await isGroupDeleted(client, groupId)) {
      throw new NotFoundException('api.notFound.group')
    }

    const groupIconId = crypto.randomUUID()

    const oldIconId = await client
      .query<{
        icon: string | null
      }>(
        'WITH old AS (SELECT icon FROM groups WHERE id = $1) UPDATE groups SET icon = $2, last_update = $3 FROM old WHERE id = $1 RETURNING old.icon',
        [groupId, groupIconId, Date.now()]
      )
      .then((r) => r.rows[0].icon)

    if (process.env.DEV === '1') {
      await imageService.saveImageToFile(buffer, `public/groupIcon/${groupIconId}.jpg`)
    } else {
      await imageService.uploadGroupIconToR2(groupIconId)
    }

    await client.query('COMMIT')

    if (oldIconId) {
      if (process.env.DEV === '1') {
        imageService.deleteGroupIcon(oldIconId).catch(() => {})
      } else {
        imageService.deleteGroupIconFromR2(oldIconId).catch(() => {})
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
