export interface GroupMetadata {
  id: string
  hidden: boolean
}

export interface GroupInfo extends GroupMetadata {
  name: string
  currency: string
  memberCount: number
  isAdmin: boolean
  hasAccess: boolean
}

export interface Member {
  id: string
  name: string
  email: string
  photoURL: string
  balance: number
}

export interface EntryData {
  email: string;
  amount: string | number;
}

export interface Entry {
  id: string;
  title: string;
  total: number;
  timestamp: number;
  paidById: string;
}