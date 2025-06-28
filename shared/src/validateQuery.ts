import { TranslatableError } from '.'
import { SplitQuery } from './types'

const MAX_TITLE_LENGTH = 512
const MAX_PARTICIPANTS_COUNT = 12
const MAX_PAID_BY_COUNT = 12
const MAX_LAST_UPDATE_BY_COUNT = 12
const MAX_USER_ID_LENGTH = 32

export function validateQuery(query: SplitQuery) {
  if (query?.title && query.title.filter.length > MAX_TITLE_LENGTH) {
    throw new TranslatableError('api.split.query.titleTooLong')
  }

  if (query.participants && query.participants.ids.length > MAX_PARTICIPANTS_COUNT) {
    throw new TranslatableError('api.split.query.tooManyParticipants')
  }

  if (query.participants && query.participants.ids.some((id) => id.length > MAX_USER_ID_LENGTH)) {
    throw new TranslatableError('api.split.query.userIdTooLong')
  }

  if (query.targetUser && query.targetUser.length > MAX_USER_ID_LENGTH) {
    throw new TranslatableError('api.split.query.userIdTooLong')
  }

  if (query.paidBy && query.paidBy.length > MAX_PAID_BY_COUNT) {
    throw new TranslatableError('api.split.query.tooManyPaidBy')
  }

  if (query.paidBy && query.paidBy.some((id) => id.length > MAX_USER_ID_LENGTH)) {
    throw new TranslatableError('api.split.query.userIdTooLong')
  }

  if (query.lastUpdateBy && query.lastUpdateBy.length > MAX_LAST_UPDATE_BY_COUNT) {
    throw new TranslatableError('api.split.query.tooManyLastUpdateBy')
  }

  if (query.lastUpdateBy && query.lastUpdateBy.some((id) => id.length > MAX_USER_ID_LENGTH)) {
    throw new TranslatableError('api.split.query.userIdTooLong')
  }
}
