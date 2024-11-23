import { GroupInfo } from '@type/group'
import { auth, db } from '@utils/firebase'
import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from 'firebase/firestore'

export async function createGroup(name: string, currency: string): Promise<GroupInfo> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a group')
  }

  const docRef = await addDoc(collection(db, 'groups'), {
    name: name,
    currency: currency,
    memberCount: 1,
  })

  await setDoc(doc(docRef, 'users', auth.currentUser.uid), {
    admin: true,
    access: true,
    hidden: false,
    balance: 0,
  })

  await updateDoc(doc(db, 'users', auth.currentUser.uid, 'data', 'groups'), {
    groups: arrayUnion(docRef.id),
  })

  return {
    id: docRef.id,
    name: name,
    currency: currency,
    hidden: false,
    isAdmin: true,
    hasAccess: true,
    memberCount: 1,
  }
}
