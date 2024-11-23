import { auth, db } from "@utils/firebase"
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore"
import { findUserIdByEmail } from "./findUserByEmail"
import { EntryData } from "@type/group"

export async function createSplit(groupId: string, title: string, total: number, entries: EntryData[]) {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to verify users')
  }

  const balances = await Promise.all(entries.map(async (entry) => {
    return {
      email: entry.email,
      id: await findUserIdByEmail(entry.email),
      amount: entry.amount
    }
  }))

  for (const entry of balances) {
    const groupUserDoc = doc(db, 'groups', groupId, 'users', entry.id)
    const userData = (await getDoc(groupUserDoc)).data()

    if (!userData) {
      throw new Error(`User ${entry.email} not part of the group`)
    }

    const newBalance = userData.balance + entry.amount

    await updateDoc(groupUserDoc, {
      balance: newBalance
    })
  }

  await addDoc(collection(db, 'groups', groupId, 'entries'), {
    title: title,
    total: total,
    changes: balances.map((entry) => {
      return {
        id: entry.id,
        amount: entry.amount
      }
    })
  })
}