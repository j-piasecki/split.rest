import { t } from 'i18next'
import { SplitInfo, isSettleUpSplit } from 'shared'

export function getSplitDisplayName(split: SplitInfo) {
  if (isSettleUpSplit(split.type)) {
    return t('splitInfo.settleUpTitle')
  }

  return split.title
}
