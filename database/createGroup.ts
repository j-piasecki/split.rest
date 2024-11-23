import { GroupInfo } from "@type/group"
import { db, auth } from "@utils/firebase"
import { addDoc, collection, setDoc, doc } from "firebase/firestore"

export async function createGroup(name: string, currency: string): Promise<GroupInfo> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to create a group')
  }

  const docRef = await addDoc(collection(db, 'groups'), {
    name: name,
    currency: currency,
    members: 1,
  })

  await setDoc(doc(docRef, 'users', auth.currentUser.uid), {
    admin: true,
  })

  await setDoc(doc(db, 'users', auth.currentUser.uid, 'groups', docRef.id), {
    hidden: false,
    admin: true,
  })

  return {
    id: docRef.id,
    name: name,
    currency: currency,
    hidden: false,
    admin: true,
  }
}
