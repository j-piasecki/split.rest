export interface GroupMetadata {
  id: string
  hidden: boolean
  admin: boolean
}

export interface GroupInfo extends GroupMetadata {
  name: string
  currency: string
  memberCount: number
}