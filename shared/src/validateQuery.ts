import { TranslatableError } from '.'
import { SplitQuery } from './types'

const MAX_TITLE_LENGTH = 100
const MAX_PARTICIPANTS_COUNT = 10

export function validateQuery(query: SplitQuery) {
  if (query?.title && query.title.filter.length > MAX_TITLE_LENGTH) {
    throw new TranslatableError('api.split.query.titleTooLong')
  }

  if (query.participants && query.participants.ids.length > MAX_PARTICIPANTS_COUNT) {
    throw new TranslatableError('api.split.query.tooManyParticipants')
  }
}
