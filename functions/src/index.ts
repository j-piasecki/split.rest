import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { createUser } from './createUser'

export { addUserToGroup } from './addUserToGroup'
export { createGroup } from './createGroup'
export { createSplit } from './createSplit'
export { deleteSplit } from './deleteSplit'
export { setGroupAccess } from './setGroupAccess'
export { setGroupAdmin } from './setGroupAdmin'
export { setGroupHidden } from './setGroupHidden'
export { getGroupMembers } from './getGroupMembers'
export { getGroupSplits } from './getGroupSplits'
