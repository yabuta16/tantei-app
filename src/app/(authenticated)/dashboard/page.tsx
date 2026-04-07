import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Case } from '@/types/case'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 全案件を取得
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  const allCases: Case[] = cases ?? []

  // サマリー集計
  const total = allCases.length
  const investigating = allCases.filter((c) => c.status === '調査中').length
  const completed = allCases.filter((c) => c.status === '完了').length
  const uninvoiced = allCases.filter((c) => c.status === '報告済').length

  // 直近5件
  const recentCases = allCases.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <Link
          href="/cases/new"
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          + 新規案件登録
        </Link>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="全案件" value={total} color="bg-gray-900" />
        <SummaryCard label="調査中" value={investigating} color="bg-yellow-500" />
        <SummaryCard label="完了" value={completed} color="bg-green-600" />
        <SummaryCard label="未請求（報告済）" value={uninvoiced} color="bg-purple-600" />
      </div>

      {/* 直近5件 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">直近の案件</h2>
          <Link href="/cases" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            すべて表示 →
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            案件がまだありません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">{c.case_number}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                    {c.client_name}（{c.case_type}）
                  </p>
                </div>
                <span className="text-xs text-gray-400 ml-4 shrink-0">
                  {new Date(c.created_at).toLocaleDateString('ja-JP')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-2 h-2 rounded-full ${color} mb-3`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
