import { auth, db } from "@utils/firebase"
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore"
import { findUserIdByEmail } from "./findUserByEmail"
import { BalanceChange } from "@type/group"

export async function createSplit(groupId: string, title: string, total: number, entries: BalanceChange[]) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to verify users')
  }

  const balances = await Promise.all(entries.map(async (entry) => {
    return {
      email: entry.email,
      id: await findUserIdByEmail(entry.email),
      change: entry.change
    }
  }))

  for (const entry of balances) {
    const groupUserDoc = doc(db, 'groups', groupId, 'users', entry.id)
    const groupUserData = (await getDoc(groupUserDoc)).data()

    if (!groupUserData) {
      throw new Error(`User ${entry.email} not part of the group`)
    }

    const newBalance = groupUserData.balance + entry.change

    await updateDoc(groupUserDoc, {
      balance: newBalance
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
        change: entry.change
      }
    })
  })
}