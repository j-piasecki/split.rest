import { SplitsList, SplitsListProps } from './SplitsList'
import { Text } from '@components/Text'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useGroupSplits } from '@hooks/database/useGroupSplits'
import { useTheme } from '@styling/theme'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SplitPermissionType } from 'shared'

export interface GroupSplitsListProps
  extends Omit<
    SplitsListProps,
    'splits' | 'isLoading' | 'isRefetching' | 'isFetchingNextPage' | 'fetchNextPage' | 'hasNextPage'
  > {
  forceShowSplitsWithUser?: boolean
}

export function GroupSplitsList(props: GroupSplitsListProps) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(props.info?.id)

  // TODO: changing forceShowSplitsWithUser causes the list to reload, shouldn't it show the current data wile loading the new one?
  const { splits, isLoading, fetchNextPage, isFetchingNextPage, isRefetching, hasNextPage } =
    useGroupSplits(
      props.info?.id,
      props.forceShowSplitsWithUser ||
        permissions?.canReadSplits() === SplitPermissionType.OnlyIfIncluded
    )

  return (
    <SplitsList
      {...props}
      splits={splits}
      isLoading={isLoading}
      isRefetching={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      emptyComponent={
        <Text style={{ fontSize: 20, color: theme.colors.outline, paddingVertical: 32 }}>
          {permissions?.canReadSplits() === SplitPermissionType.None
            ? t('api.insufficientPermissions.group.readSplits')
            : permissions?.canReadSplits() === SplitPermissionType.OnlyIfIncluded
              ? t('splitList.noAccessibleSplits')
              : props.forceShowSplitsWithUser
                ? t('splitList.noSplitsWhereIncluded')
                : t('splitList.noSplits')}
        </Text>
      }
    />
  )
}
