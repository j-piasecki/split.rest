import ModalScreen from '@components/ModalScreen'
import { Text } from '@components/Text'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useGroupJoinLink } from '@hooks/database/useGroupJoinLink'
import { useGroupPermissions } from '@hooks/database/useGroupPermissions'
import { useModalScreenInsets } from '@hooks/useModalScreenInsets'
import { useTheme } from '@styling/theme'
import { getJoinLinkURL } from '@utils/getJoinLinkURL'
import { GroupPermissions } from '@utils/GroupPermissions'
import { useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { GroupUserInfo } from 'shared'

function QRCodeWrapper({
  info,
  permissions,
}: {
  info: GroupUserInfo
  permissions: GroupPermissions
}) {
  const theme = useTheme()
  const insets = useModalScreenInsets()
  const [containerWidth, setContainerWidth] = useState(0)
  const { t } = useTranslation()
  const { data: link, isLoading: isLoadingLink } = useGroupJoinLink(info.id)
  const linkText = getJoinLinkURL(link)

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: 64 + insets.bottom,
        paddingLeft: 12 + insets.left,
        paddingRight: 12 + insets.right,
        paddingTop: 12 + insets.top,
      }}
    >
      {isLoadingLink && <ActivityIndicator color={theme.colors.primary} />}
      {!permissions.canSeeJoinLink() && (
        <Text
          style={{
            fontSize: 18,
            color: theme.colors.onSurface,
            fontWeight: 600,
            paddingHorizontal: 24,
            textAlign: 'center',
          }}
        >
          {t('api.insufficientPermissions.group.joinLink.see')}
        </Text>
      )}
      {link && permissions.canSeeJoinLink() && (
        <View onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width)
        }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Text
            style={{
              color: theme.colors.onTertiaryContainer,
              fontSize: 18,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {t('groupSettings.joinLink.anyoneCanJoinWithQR')}
          </Text>
          <QRCode
            size={Math.min(300, containerWidth)}
            value={linkText}
            logoSVG={`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 33.87 33.87"><defs><clipPath id="a" clipPathUnits="userSpaceOnUse"><circle cx="16.93" cy="16.93" r="16.93" stroke-width="8.74"/></clipPath><clipPath id="b" clipPathUnits="userSpaceOnUse"><rect width="33.87" height="33.87" stroke-linecap="round" stroke-linejoin="round" stroke-width="30.14" ry="0"/></clipPath></defs><g fill="${theme.colors.primary}" clip-path="url(#a)"><path d="M-.6 34.8c-.61-4.96-7.27-6.96-7.1-10.8 1.87-2.12 10.32-7.93 17.25-6.3 5.24 1.22 9.86 2.64 10.37 2.78.51.13.93.27.93.3 0 .02-.1.1-.22.16-.2.11-.52.13-3.35.16-1.04.02-2.95.02-3.12.06-.15.04-.26.1-.39.16-.45.22-.82.6-1.04 1.1-.15.33-.17.44-.14.95a2 2 0 0 0 .18.87c.22.44.58.8 1 1 .37.19.42.2 1.74.22l1.35.02.04.33c.08.65.55 1.28 1.18 1.59.32.15.47.18.95.18.5 0 .62-.02.95-.18a2.1 2.1 0 0 0 1.18-1.66l.04-.38.41-.12a5.5 5.5 0 0 0 3.37-2.88c.14-.31.24-.44.3-.43 9.8 2.65 9.6 6.84 10.22 8.08-.56 4.36-.59 1.32-1.04 4.6-12.1 1.25-24.3.66-35.06.19zm22.8-18.08a416.79 416.79 0 0 1-9.48-2.59c-.2-.19-.06-.85.23-1.11.34-.3.33-.3 3.6-.33 3.09-.04 3.12-.04 3.43-.2.42-.2.8-.58 1-.98.14-.28.17-.43.17-.97 0-.75-.13-1.1-.58-1.54-.53-.53-.72-.58-2.29-.6l-1.39-.02-.03-.33a2.14 2.14 0 0 0-1.18-1.63 2.78 2.78 0 0 0-1.9 0c-.65.31-1.13.98-1.2 1.64-.02.24-.05.32-.13.32-.06 0-.36.1-.66.2a5.44 5.44 0 0 0-3.56 4.3C2.08 11.25-.59 8.42-2.16 4.98c.2-2.25 1.15-1.83 1.55-5.26 5.25-.4 27.3-.84 37.8-.89.02 4.71 1.08 10.45 1.84 15.57-3.33 3.18-11.78 3.72-16.84 2.32Z" clip-path="url(#b)"/></g></svg>`}
            logoSize={64}
            logoMargin={8}
            logoBorderRadius={36}
            backgroundColor={theme.colors.surfaceContainer}
            color={theme.colors.onSurface}
          />
        </View>
      )}
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const { t } = useTranslation()
  const { data: info } = useGroupInfo(Number(id))
  const { data: permissions } = useGroupPermissions(Number(id))

  return (
    <ModalScreen
      returnPath={`/group/${id}`}
      title={t('screenName.groupSettings.joinQrCode')}
      maxWidth={500}
      maxHeight={650}
      opaque={false}
      slideAnimation={false}
    >
      {info && permissions && <QRCodeWrapper info={info} permissions={permissions} />}
    </ModalScreen>
  )
}
