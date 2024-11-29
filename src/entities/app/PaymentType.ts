import { SchoolListType } from '../school/SchoolType'
import { UserListType } from '../school/UserType'

export type PaymentType = {
  id: string
  payer: UserListType | null
  school: SchoolListType | null
  amount: string | null
  status: string | null
  card_name: string | null
  used_days: number
  bank_type: string
  comment: string | null
  month: number | null
  tariff_type: string | null
  school_months: number | null
  center_months: number | null
  students: UserListType[] | null
  updated_at: string | null
  created_at: string
}

export type PaymentTotalsType = {
  [key: string]: number
}
