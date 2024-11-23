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

export interface Member {
  id: string
  name: string
  email: string
  balance: number
}

export interface EntryData {
  email: string;
  amount: string | number;
}