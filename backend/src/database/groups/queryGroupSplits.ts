import { NotFoundException } from '../../errors/NotFoundException'
import { isGroupDeleted } from '../utils/isGroupDeleted'
import { Pool } from 'pg'
import { QueryGroupSplitsArguments, SplitInfo, validateQuery } from 'shared'

export async function queryGroupSplits(
  pool: Pool,
  callerId: string,
  args: QueryGroupSplitsArguments
): Promise<SplitInfo[]> {
  if (await isGroupDeleted(pool, args.groupId)) {
    throw new NotFoundException('api.notFound.group')
  }

  validateQuery(args.query)

  const whereClauses: string[] = [`group_id = $1`, `deleted = false`]
  const values: any[] = [args.groupId, callerId]
  let paramIndex = values.length + 1

  // ORDER BY clause
  const orderByColumn =
    args.query?.orderBy === 'title'
      ? 'splits.name'
      : args.query?.orderBy === 'total'
        ? 'splits.total'
        : 'splits.id'
  const orderDirection = args.query?.orderDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const orderClause =
    orderByColumn === 'splits.name'
      ? `ORDER BY splits.name ${orderDirection}, splits.id DESC`
      : orderByColumn === 'splits.total'
        ? `ORDER BY splits.total ${orderDirection}, splits.id DESC`
        : `ORDER BY splits.id ${orderDirection}`

  // Pagination handling
  if (args.startAfter) {
    if (orderByColumn === 'splits.name') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(
        `(splits.name ${comparator} $${paramIndex} OR (splits.name = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.title, args.startAfter.id)
      paramIndex += 2
    } else if (orderByColumn === 'splits.total') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(
        `(splits.total ${comparator} $${paramIndex} OR (splits.total = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.total, args.startAfter.id)
      paramIndex += 2
    } else {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(`splits.id ${comparator} $${paramIndex}`)
      values.push(args.startAfter.id)
      paramIndex++
    }
  }

  // Title filter
  if (args.query?.title?.type === 'contains') {
    whereClauses.push(
      `splits.name ${args.query.title.caseSensitive ? 'LIKE' : 'ILIKE'} '%' || $${paramIndex} || '%'`
    )
    values.push(args.query.title.filter)
    paramIndex++
  } else if (args.query?.title?.type === 'regex') {
    whereClauses.push(`splits.name ${args.query.title.caseSensitive ? '~' : '~*'} $${paramIndex}`)
    values.push(args.query.title.filter)
    paramIndex++
  }

  // Participants filter
  let havingClause = ''
  if (args.query?.participants) {
    if (args.query.participants.type === 'all') {
      whereClauses.push(`split_participants.user_id = ANY($${paramIndex})`)
      values.push(args.query.participants.ids)
      havingClause = `HAVING COUNT(DISTINCT split_participants.user_id) = ${args.query.participants.ids.length}`
      paramIndex++
    } else if (args.query.participants.type === 'oneOf') {
      whereClauses.push(`
      EXISTS (
        SELECT 1 FROM split_participants sp
        WHERE sp.split_id = splits.id AND sp.user_id = ANY($${paramIndex})
      )
    `)
      values.push(args.query.participants.ids)
      paramIndex++
    }
  }

  // Final query
  const query = `
    SELECT
      splits.id,
      splits.name,
      splits.total,
      splits.paid_by,
      splits.created_by,
      splits.timestamp,
      splits.updated_at,
      splits.version,
      splits.deleted,
      splits.type,
      (SELECT EXISTS (
        SELECT 1 FROM split_participants 
        WHERE split_participants.split_id = splits.id AND pending = true
      )) AS pending,
      (SELECT change FROM split_participants 
        WHERE split_participants.split_id = splits.id AND split_participants.user_id = $2
      ) AS user_change,
      (SELECT EXISTS (
        (SELECT 1 WHERE splits.created_by = $2 OR splits.paid_by = $2)
        UNION
        (SELECT 1 FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $2)
        UNION
        (SELECT 1 FROM split_edits WHERE split_edits.id = splits.id AND (split_edits.created_by = $2 OR split_edits.paid_by = $2))
        UNION
        (SELECT 1 FROM split_participants_edits WHERE split_participants_edits.split_id = splits.id AND split_participants_edits.user_id = $2)
      )) AS user_participating
    FROM splits
    INNER JOIN split_participants ON splits.id = split_participants.split_id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY splits.id
    ${havingClause}
    ${orderClause}
    LIMIT 20
  `

  const { rows } = await pool.query(query, values)

  return rows.map((row) => ({
    id: row.id,
    title: row.name,
    total: row.total,
    paidById: row.paid_by,
    createdById: row.created_by,
    timestamp: Number(row.timestamp),
    version: row.version,
    updatedAt: Number(row.updated_at),
    type: row.type,
    isUserParticipating: row.user_participating,
    pending: row.pending,
    userChange: row.user_change,
  }))
}
