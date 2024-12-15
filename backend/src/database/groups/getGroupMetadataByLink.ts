import { NotFoundException } from '../../errors/NotFoundException'
import { Pool } from 'pg'
import { GroupMetadata } from 'shared'
import { GetGroupMetadataByLinkArguments } from 'shared/src/endpointArguments'

export async function getGroupMetadataByLink(
  pool: Pool,
  args: GetGroupMetadataByLinkArguments
): Promise<GroupMetadata> {
  const { rows } = await pool.query(
    `
      SELECT 
        groups.id,
        groups.name,
        groups.owner,
        groups.currency,
        groups.total,
        groups.deleted,
        groups.member_count
      FROM
        groups 
      JOIN
        group_join_links ON groups.id = group_join_links.group_id
      WHERE
        group_join_links.uuid = $1
        AND groups.deleted = false
    `,
    [args.uuid]
  )

  if (rows.length === 0) {
    throw new NotFoundException('api.notFound.group')
  }

  return {
    id: rows[0].id,
    name: rows[0].name,
    owner: rows[0].owner,
    currency: rows[0].currency,
    memberCount: rows[0].member_count,
    total: rows[0].total,
  }
}
