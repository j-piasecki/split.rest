import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { createUser } from './createUser'

export { addUserToGroup } from './addUserToGroup'
export { createGroup } from './createGroup'
export { createSplit } from './createSplit'
