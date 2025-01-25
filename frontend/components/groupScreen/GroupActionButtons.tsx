import { Button } from '@components/Button'
import { ButtonShimmer } from '@components/ButtonShimmer'
import { useSetGroupHiddenMutation } from '@hooks/database/useGroupHiddenMutation'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useAuth } from '@utils/auth'
import { beginNewSplit } from '@utils/splitCreationContext'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { GroupUserInfo } from 'shared'

export function GroupActionButtons({ info }: { info: GroupUserInfo | undefined }) {
  const user = useAuth()

  const { t } = useTranslation()
  const { data: permissions } = useGroupPermissions(info?.id)
  const { mutate: setGroupHiddenMutation } = useSetGroupHiddenMutation(info?.id)

  return (
    <View style={{ flexDirection: 'column', gap: 12 }}>
      <ButtonShimmer argument={permissions}>
        {(permissions) =>
          permissions.canAccessRoulette() && (
            <Button
              onPress={() => {
                router.navigate(`/group/${info!.id}/roulette`)
              }}
              title={t('groupInfo.roulette')}
              leftIcon='payments'
            />
          )
        }
      </ButtonShimmer>

      <ButtonShimmer argument={permissions} offset={-0.05}>
        {(permissions) =>
          permissions.canCreateSplits() && (
            <Button
              onPress={() => {
                beginNewSplit()
                router.navigate(`/group/${info!.id}/addSplit`)
              }}
              title={t('groupInfo.addSplit')}
              leftIcon='split'
            />
          )
        }
      </ButtonShimmer>

      <ButtonShimmer argument={info} offset={-0.1}>
        {(info) =>
          info.hidden ? (
            <Button
              title={t('groupInfo.showGroup')}
              onPress={() => {
                setGroupHiddenMutation(false)
              }}
              leftIcon='visibility'
            />
          ) : (
            <Button
              title={t('groupInfo.hideGroup')}
              onPress={() => {
                setGroupHiddenMutation(true)
              }}
              leftIcon='visibilityOff'
            />
          )
        }
      </ButtonShimmer>

      {info && (info.isAdmin || info.owner === user?.id) && (
        <Button
          title={t('groupInfo.settings')}
          onPress={() => router.navigate(`/group/${info.id}/settings`)}
          leftIcon='settings'
        />
      )}
    </View>
  )
}
