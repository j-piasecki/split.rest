import { auth, db } from '@utils/firebase'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export async function addUserToGroup(groupId: string, userId: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to add users to a group')
  }

  const groupData = (await getDoc(doc(db, 'groups', groupId))).data()

  if (!groupData) {
    throw new Error(`Group not found`)
  }

  const groupUserData = (
    await getDoc(doc(db, 'groups', groupId, 'users', auth.currentUser.uid))
  ).data()

  if (!groupUserData?.admin) {
    throw new Error(`You do not have permission to add users to this group`)
  }

  const userAlreadyAMember = (await getDoc(doc(db, 'groups', groupId, 'users', userId))).exists()

  if (userAlreadyAMember) {
    throw new Error(`User is already a member of the group`)
  }

  const userExists = (await getDoc(doc(db, 'users', userId))).exists()

  if (!userExists) {
    throw new Error(`User not found`)
  }

  await setDoc(doc(db, 'groups', groupId, 'users', userId), {
    balance: 0,
    admin: false,
    access: true,
    hidden: false,
  })

  await updateDoc(doc(db, 'users', userId, 'data', 'groups'), {
    groups: arrayUnion(groupId),
  })
}
