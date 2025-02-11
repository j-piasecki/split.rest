import { t } from "i18next";
import { SplitInfo, SplitType } from "shared";

export function getSplitDisplayName(split: SplitInfo) {
  if (split.type & SplitType.SettleUp) {
    return t('splitInfo.settleUpTitle')
  }

  return split.title
}