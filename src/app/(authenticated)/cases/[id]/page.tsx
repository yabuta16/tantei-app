import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CaseDetailActions } from '@/components/CaseDetailActions'
import { Case } from '@/types/case'

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()
  const c: Case = data

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/cases" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← 案件一覧
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-xl font-bold text-gray-900">{c.client_name}</h1>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">{c.case_number}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/cases/${c.id}/invoice`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            請求書
          </Link>
          <Link
            href={`/cases/${c.id}/edit`}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            編集
          </Link>
        </div>
      </div>

      {/* ステータス変更・削除アクション */}
      <CaseDetailActions caseData={c} />

      {/* 詳細情報 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">基本情報</h2>
        </div>
        <dl className="divide-y divide-gray-100">
          <DetailRow label="案件種別" value={c.case_type} />
          <DetailRow label="ステータス" value={<StatusBadge status={c.status} />} />
          <DetailRow label="受任日" value={c.start_date ? new Date(c.start_date).toLocaleDateString('ja-JP') : '—'} />
          <DetailRow label="完了予定日" value={c.due_date ? new Date(c.due_date).toLocaleDateString('ja-JP') : '—'} />
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">依頼人情報</h2>
        </div>
        <dl className="divide-y divide-gray-100">
          <DetailRow label="依頼人名" value={c.client_name} />
          <DetailRow label="フリガナ" value={c.client_kana ?? '—'} />
          <DetailRow label="電話番号" value={c.client_phone ?? '—'} />
          <DetailRow label="メールアドレス" value={c.client_email ?? '—'} />
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">調査対象者</h2>
        </div>
        <dl>
          <DetailRow label="対象者名" value={c.subject_name ?? '—'} />
        </dl>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">費用</h2>
        </div>
        <dl className="divide-y divide-gray-100">
          <DetailRow label="着手金額" value={c.retainer_fee ? `¥${c.retainer_fee.toLocaleString()}` : '—'} />
          <DetailRow label="総費用" value={c.total_fee ? `¥${c.total_fee.toLocaleString()}` : '—'} />
        </dl>
      </div>

      {c.notes && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">備考</h2>
          </div>
          <div className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap">{c.notes}</div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-right">
        登録: {new Date(c.created_at).toLocaleString('ja-JP')} ／
        更新: {new Date(c.updated_at).toLocaleString('ja-JP')}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3 px-6 py-3">
      <dt className="text-xs font-medium text-gray-500 flex items-center">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-800">{value}</dd>
    </div>
  )
}
