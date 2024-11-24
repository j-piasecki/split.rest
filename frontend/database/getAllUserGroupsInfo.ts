import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { GroupInfo, GroupMetadata } from 'shared'

export async function getAllUserGroupsInfo(metadata: GroupMetadata[]) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const groups = await Promise.all(
    metadata.map(async (group): Promise<GroupInfo | undefined> => {
      const groupData = (await getDoc(doc(db, 'groups', group.id))).data()
      if (groupData) {
        return {
          id: group.id,
          name: groupData.name,
          currency: groupData.currency,
          hidden: group.hidden,
          memberCount: groupData.memberCount,
          isAdmin: groupData.admin,
          hasAccess: groupData.access,
        }
      } else {
        console.error(`Group with id ${group.id} not found`)
      }
    })
  )

  return groups.filter((group): group is GroupInfo => group !== undefined)
}
