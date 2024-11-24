import { auth, db } from '@utils/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { GroupMetadata } from 'shared'

// TODO: this should be fine like this, there needs to be a rule that a user can
// only read their own document

export async function getAllUserGroupsMetadata(): Promise<GroupMetadata[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const userGroupsRef = doc(db, 'users', auth.currentUser.uid, 'data', 'groups')
  const data = (await getDoc(userGroupsRef)).data()

  const result: GroupMetadata[] = []

  if (data) {
    data.groups.forEach((groupId: string) => {
      result.push({
        id: groupId,
        hidden: data.hidden.includes(groupId),
      })
    })
  }

  return result
}
