import { Button } from '@components/Button'
import ModalScreen from '@components/ModalScreen'
import { TextInput } from '@components/TextInput'
import { useDeleteGroup } from '@hooks/database/useDeleteGroup'
import { useGroupInfo } from '@hooks/database/useGroupInfo'
import { useSetGroupNameMutation } from '@hooks/database/useSetGroupName'
import { useTheme } from '@styling/theme'
import { useAuth } from '@utils/auth'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { GroupInfo } from 'shared'

function Form({ info }: { info: GroupInfo }) {
  const user = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const [name, setName] = useState(info.name)
  const { mutateAsync: setGroupName, isPending: isSettingName } = useSetGroupNameMutation(info.id)
  const { mutateAsync: deleteGroup, isPending: isDeletingGroup } = useDeleteGroup()

  const waiting = isSettingName || isDeletingGroup

  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        paddingBottom: 32,
      }}
    >
      <TextInput placeholder='Group name' value={name} onChangeText={setName} />
      {!waiting && (
        <>
          {info.owner === user?.id && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* TODO: add confirmation dialog, more generic button */}
              <Pressable
                onPress={async () => {
                  await deleteGroup(info.id)
                  router.replace(`/`)
                }}
                style={({ pressed }) => {
                  return {
                    backgroundColor: theme.colors.errorContainer,
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  }
                }}
              >
                <Text
                  selectable={false}
                  style={{ color: theme.colors.onErrorContainer, fontWeight: 'bold', fontSize: 16 }}
                >
                  Delete group
                </Text>
              </Pressable>
            </View>
          )}
          <View>
            <Button title='Save' onPress={() => setGroupName(name)} />
          </View>
        </>
      )}
      {waiting && <ActivityIndicator color={theme.colors.primary} />}
    </View>
  )
}

export default function Settings() {
  const { id } = useLocalSearchParams()
  const user = useAuth()
  const theme = useTheme()
  const { data: info } = useGroupInfo(Number(id))

  const isAdmin = info?.isAdmin || info?.owner === user?.id

  return (
    <ModalScreen returnPath={`/${id}`} title='Group settings' maxWidth={400} maxHeight={400}>
      {isAdmin && info && <Form info={info} />}
      {!isAdmin && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {(!user || !info) && <ActivityIndicator color={theme.colors.primary} />}
          {user && info && (
            <Text style={{ color: theme.colors.error }}>You are not an admin of this group</Text>
          )}
        </View>
      )}
    </ModalScreen>
  )
}
