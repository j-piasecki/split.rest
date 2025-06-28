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
  const values: any[] = [args.groupId, callerId, args.query.targetUser ?? callerId]
  let paramIndex = values.length + 1

  // ORDER BY clause
  const orderDirection = args.query?.orderDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const orderClause =
    args.query?.orderBy === 'title'
      ? `ORDER BY splits.name ${orderDirection}, splits.id DESC`
      : args.query?.orderBy === 'total'
        ? `ORDER BY splits.total ${orderDirection}, splits.id DESC`
        : args.query?.orderBy === 'balanceChange'
          ? `ORDER BY user_change ${orderDirection}, splits.id DESC`
          : args.query?.orderBy === 'updatedAt'
            ? `ORDER BY splits.updated_at ${orderDirection}, splits.id DESC`
            : `ORDER BY splits.id ${orderDirection}`

  // Pagination handling
  if (args.startAfter) {
    if (args.query?.orderBy === 'title') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(
        `(splits.name ${comparator} $${paramIndex} OR (splits.name = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.title, args.startAfter.id)
      paramIndex += 2
    } else if (args.query?.orderBy === 'total') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(
        `(splits.total ${comparator} $${paramIndex} OR (splits.total = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.total, args.startAfter.id)
      paramIndex += 2
    } else if (args.query?.orderBy === 'balanceChange') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      const subquery = `COALESCE((SELECT change FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $3 AND split_participants.pending = false), 0)`
      whereClauses.push(
        `(${subquery} ${comparator} $${paramIndex} OR (${subquery} = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.userChange, args.startAfter.id)
      paramIndex += 2
    } else if (args.query?.orderBy === 'updatedAt') {
      const comparator = orderDirection === 'ASC' ? '>' : '<'
      whereClauses.push(
        `(splits.updated_at ${comparator} $${paramIndex} OR (splits.updated_at = $${paramIndex} AND splits.id < $${paramIndex + 1}))`
      )
      values.push(args.startAfter.updatedAt, args.startAfter.id)
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

  // Timestamp filters
  if (args.query?.beforeTimestamp) {
    whereClauses.push(`splits.timestamp < $${paramIndex}`)
    values.push(args.query.beforeTimestamp)
    paramIndex++
  }
  if (args.query?.afterTimestamp) {
    whereClauses.push(`splits.timestamp > $${paramIndex}`)
    values.push(args.query.afterTimestamp)
    paramIndex++
  }
  if (args.query?.lastUpdateBeforeTimestamp) {
    whereClauses.push(`splits.updated_at < $${paramIndex}`)
    values.push(args.query.lastUpdateBeforeTimestamp)
    paramIndex++
  }
  if (args.query?.lastUpdateAfterTimestamp) {
    whereClauses.push(`splits.updated_at > $${paramIndex}`)
    values.push(args.query.lastUpdateAfterTimestamp)
    paramIndex++
  }

  // Paid by filter
  if (args.query?.paidBy) {
    whereClauses.push(`splits.paid_by = ANY($${paramIndex})`)
    values.push(args.query.paidBy)
    paramIndex++
  }

  // Last update by filter
  if (args.query?.lastUpdateBy) {
    whereClauses.push(`splits.created_by = ANY($${paramIndex})`)
    values.push(args.query.lastUpdateBy)
    paramIndex++
  }

  // Edited filter
  if (args.query?.edited === true) {
    whereClauses.push(`splits.version > 1`)
  } else if (args.query?.edited === false) {
    whereClauses.push(`splits.version = 1`)
  }

  // Pending filter
  if (args.query?.pending !== undefined) {
    const subquery = `(SELECT EXISTS (
      SELECT 1 FROM split_participants 
      WHERE split_participants.split_id = splits.id AND split_participants.pending = true
    ))`
    whereClauses.push(`${subquery} = $${paramIndex}`)
    values.push(args.query.pending)
    paramIndex++
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
      COALESCE((
        SELECT change FROM split_participants 
        WHERE split_participants.split_id = splits.id AND split_participants.user_id = $3 and pending = FALSE
      ), 0) AS user_change,
      (SELECT EXISTS (
        (SELECT 1 WHERE splits.created_by = $2 OR splits.paid_by = $2)
        UNION
        (SELECT 1 FROM split_participants WHERE split_participants.split_id = splits.id AND split_participants.user_id = $2)
        UNION
        (SELECT 1 FROM split_edits WHERE split_edits.id = splits.id AND (split_edits.created_by = $2 OR split_edits.paid_by = $2))
        UNION
        (SELECT 1 FROM split_participants_edits WHERE split_participants_edits.split_id = splits.id AND split_participants_edits.user_id = $2)
      )) AS caller_participating
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
    isUserParticipating: row.caller_participating,
    pending: row.pending,
    userChange: row.user_change,
  }))
}
