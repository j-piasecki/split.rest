import { BalanceChange } from '@type/group'
import { auth, db } from '@utils/firebase'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'

export async function createSplit(
  groupId: string,
  title: string,
  total: number,
  balances: BalanceChange[]
) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to verify users')
  }

  for (const entry of balances) {
    const groupUserDoc = doc(db, 'groups', groupId, 'users', entry.id)
    const groupUserData = (await getDoc(groupUserDoc)).data()

    if (!groupUserData) {
      // TODO: can this be done in other way, so that `increment` can be used?
      const userData = (await getDoc(doc(db, 'users', entry.id))).data()!
      throw new Error(`User ${userData.email} not part of the group`)
    }

    const newBalance = groupUserData.balance + entry.change

    await updateDoc(groupUserDoc, {
      balance: newBalance,
    })
  }

  await addDoc(collection(db, 'groups', groupId, 'entries'), {
    title: title,
    total: total,
    timestamp: Date.now(),
    paidBy: auth.currentUser.uid,
    changes: balances.map((entry) => {
      return {
        id: entry.id,
        change: entry.change,
      }
    }),
  })
}
