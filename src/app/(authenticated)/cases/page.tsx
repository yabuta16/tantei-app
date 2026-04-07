import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Case, CASE_STATUSES, CaseStatus } from '@/types/case'

type SearchParams = { status?: string }

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('cases').select('*').order('created_at', { ascending: false })
  if (status && CASE_STATUSES.includes(status as CaseStatus)) {
    query = query.eq('status', status)
  }

  const { data: cases } = await query
  const allCases: Case[] = cases ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">案件一覧</h1>
        <Link
          href="/cases/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + 新規案件登録
        </Link>
      </div>

      {/* ステータスフィルター */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/cases"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !status ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >
          すべて
        </Link>
        {CASE_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/cases?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              status === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* 案件テーブル */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {allCases.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            該当する案件がありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">案件番号</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ステータス</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">依頼人</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">案件種別</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">受任日</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">完了予定日</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">総費用</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="block">
                        <span className="font-mono text-xs text-gray-500">{c.case_number}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="block">
                        <StatusBadge status={c.status} />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cases/${c.id}`} className="block">
                        <span className="font-medium text-gray-800">{c.client_name}</span>
                        {c.client_kana && (
                          <span className="block text-xs text-gray-400">{c.client_kana}</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/cases/${c.id}`} className="block">
                        {c.case_type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <Link href={`/cases/${c.id}`} className="block">
                        {c.start_date ? new Date(c.start_date).toLocaleDateString('ja-JP') : '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      <Link href={`/cases/${c.id}`} className="block">
                        {c.due_date ? new Date(c.due_date).toLocaleDateString('ja-JP') : '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-800 hidden lg:table-cell">
                      <Link href={`/cases/${c.id}`} className="block">
                        {c.total_fee ? `¥${c.total_fee.toLocaleString()}` : '—'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
