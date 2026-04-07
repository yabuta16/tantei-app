export type CaseStatus = '相談中' | '受任' | '調査中' | '報告済' | '完了' | '請求済'

export type CaseType = '浮気・不倫調査' | '人物調査' | '身辺調査' | '企業調査' | 'その他'

export interface Case {
  id: string
  case_number: string
  case_type: CaseType
  client_name: string
  client_kana: string | null
  client_phone: string | null
  client_email: string | null
  subject_name: string | null
  start_date: string | null
  due_date: string | null
  retainer_fee: number
  total_fee: number
  status: CaseStatus
  notes: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export type CaseInsert = Omit<Case, 'id' | 'created_at' | 'updated_at'>
export type CaseUpdate = Partial<Omit<Case, 'id' | 'created_at' | 'updated_at' | 'user_id'>>

export const CASE_STATUSES: CaseStatus[] = ['相談中', '受任', '調査中', '報告済', '完了', '請求済']
export const CASE_TYPES: CaseType[] = ['浮気・不倫調査', '人物調査', '身辺調査', '企業調査', 'その他']

export const STATUS_COLORS: Record<CaseStatus, string> = {
  '相談中': 'bg-gray-100 text-gray-700',
  '受任':   'bg-blue-100 text-blue-700',
  '調査中': 'bg-yellow-100 text-yellow-700',
  '報告済': 'bg-purple-100 text-purple-700',
  '完了':   'bg-green-100 text-green-700',
  '請求済': 'bg-red-100 text-red-700',
}
