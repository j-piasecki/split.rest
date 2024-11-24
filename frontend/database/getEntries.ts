import { Entry } from '@type/group'
import { auth, db } from '@utils/firebase'
import { collection, getDocs, limit, query } from 'firebase/firestore'

export async function getEntries(groupId: string): Promise<Entry[]> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to get the entries')
  }

  const entriesSnapshot = await getDocs(
    query(collection(db, 'groups', groupId, 'entries'), limit(10))
  )

  const result: Entry[] = []

  entriesSnapshot.forEach((doc) => {
    const data = doc.data()
    result.push({
      id: doc.id,
      title: data.title,
      total: data.total,
      timestamp: data.timestamp,
      paidById: data.paidBy,
      changes: data.changes,
    })
  })

  return result
}
