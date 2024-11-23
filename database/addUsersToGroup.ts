import { auth, db } from "@utils/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"

export async function addUserToGroup(groupId: string, userId: string) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to add users to a group')
  }

  const groupDoc = doc(db, 'groups', groupId)
  const groupMetaDoc = doc(db, 'users', auth.currentUser.uid, 'groups', groupId)

  const groupData = (await getDoc(groupDoc)).data()
  const groupMetaData = (await getDoc(groupMetaDoc)).data()

  if (!groupData || !groupMetaData) {
    throw new Error(`Group not found`)
  }

  const groupUserDoc = doc(db, 'groups', groupId, 'users', userId)
  const userAlreadyAMember = (await getDoc(groupUserDoc)).exists()

  if (!groupMetaData.admin) {
    throw new Error(`You do not have permission to add users to this group`)
  }

  if (userAlreadyAMember) {
    throw new Error(`User is already a member of the group`)
  }

  const userDoc = doc(db, 'users', userId)
  const userExists = (await getDoc(userDoc)).exists()

  if (!userExists) {
    throw new Error(`User not found`)
  }

  await setDoc(doc(db, 'users', userId, 'groups', groupId), {
    hidden: false,
    admin: false,
  })

  await setDoc(doc(db, 'groups', groupId, 'users', userId), {
    balance: 0,
    admin: false,
  })
}