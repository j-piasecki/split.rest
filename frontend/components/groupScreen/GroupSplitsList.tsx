import { SplitsList, SplitsListProps } from './SplitsList'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSplitsQuery } from '@hooks/database/useGroupSplitsQuery'
import { useSplitQueryConfig } from '@hooks/useSplitQueryConfig'
import { buildQuery } from '@hooks/useSplitQueryConfigBuilder'
import { useThreeBarLayout } from '@utils/dimensionUtils'
import { defaultQueryConfig } from '@utils/splitQueryConfig'
import React from 'react'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GroupSplitsListProps
  extends Omit<
    SplitsListProps,
    'splits' | 'isLoading' | 'isRefetching' | 'isFetchingNextPage' | 'fetchNextPage' | 'hasNextPage'
  > {}

export function GroupSplitsList(props: GroupSplitsListProps) {
  return <InnerGroupSplitsList {...props} />
}

function InnerGroupSplitsList(props: GroupSplitsListProps) {
  const threeBarLayout = useThreeBarLayout()
  const query = useSplitQueryConfig(props.info?.id)
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(props.info?.id)

  const { splits, isLoading, fetchNextPage, isFetchingNextPage, isRefetching, hasNextPage } =
    useGroupSplitsQuery(props.info?.id, buildQuery(query))

  return (
    <SplitsList
      {...props}
      splits={splits}
      isLoading={isLoading}
      isRefetching={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      applyHorizontalPadding={!threeBarLayout}
      emptyMessage={
        permissions?.canQuerySplits() === false
          ? t('api.insufficientPermissions.group.querySplits')
          : query !== defaultQueryConfig
            ? t('splitList.noSplitsMatchingQuery')
            : t('splitList.noSplits')
      }
    />
  )
}
