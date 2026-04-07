'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Case, CASE_STATUSES, CaseStatus } from '@/types/case'

export function CaseDetailActions({ caseData }: { caseData: Case }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleStatusChange(newStatus: CaseStatus) {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('cases').update({ status: newStatus }).eq('id', caseData.id)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('cases').delete().eq('id', caseData.id)
    router.push('/cases')
    router.refresh()
  }

  const nextStatuses = CASE_STATUSES.filter((s) => s !== caseData.status)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <p className="text-xs font-medium text-gray-500">ステータスを変更</p>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={loading}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:border-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {s}に変更
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            この案件を削除する
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-red-600">本当に削除しますか？</span>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              削除する
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              キャンセル
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
