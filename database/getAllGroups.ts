import { GroupMetadata } from '@type/group'
import { auth, db } from '@utils/firebase'
import { collection, getDocs, limit, query } from 'firebase/firestore'

export async function getAllGroups() {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get all groups')
  }

  const querySnapshot = await getDocs(
    query(collection(db, 'users', auth.currentUser.uid, 'groups'), limit(10))
  )

  const result: GroupMetadata[] = []
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    result.push({
      id: doc.id,
      hidden: data.hidden,
    })
  })

  return result
}
