import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Case } from '@/types/case'
import { PrintButton } from '@/components/PrintButton'
import Link from 'next/link'

export default async function InvoicePage({
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

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const invoiceNumber = `INV-${c.case_number}`

  return (
    <>
      {/* 印刷時に非表示になるコントロールバー */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href={`/cases/${c.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← 案件詳細に戻る
        </Link>
        <PrintButton />
      </div>

      {/* 請求書本体 */}
      <div className="invoice-page bg-white mx-auto" style={{ maxWidth: '794px', padding: '60px' }}>
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-wider">請　求　書</h1>
          </div>
          <div className="text-right text-sm text-gray-600 space-y-1">
            <p>請求番号：{invoiceNumber}</p>
            <p>発行日：{today}</p>
          </div>
        </div>

        {/* 宛先 */}
        <div className="mb-10">
          <p className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-1">
            {c.client_name}　様
          </p>
          {c.client_kana && (
            <p className="text-xs text-gray-500">{c.client_kana}</p>
          )}
        </div>

        {/* 請求金額 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10 text-center">
          <p className="text-sm text-gray-500 mb-1">ご請求金額（税込）</p>
          <p className="text-4xl font-bold text-gray-900">
            ¥{c.total_fee.toLocaleString()}
          </p>
        </div>

        {/* 明細テーブル */}
        <table className="w-full text-sm mb-10">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-2 font-semibold text-gray-700">項目</th>
              <th className="text-right py-2 font-semibold text-gray-700">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3 text-gray-800">
                調査費用（{c.case_type}）
                <span className="block text-xs text-gray-400 mt-0.5">案件番号：{c.case_number}</span>
              </td>
              <td className="py-3 text-right text-gray-800">
                ¥{(c.total_fee - c.retainer_fee).toLocaleString()}
              </td>
            </tr>
            {c.retainer_fee > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-3 text-gray-800">着手金（受領済）</td>
                <td className="py-3 text-right text-gray-800">
                  −¥{c.retainer_fee.toLocaleString()}
                </td>
              </tr>
            )}
            <tr className="border-t-2 border-gray-900">
              <td className="py-3 font-bold text-gray-900">合計</td>
              <td className="py-3 text-right font-bold text-gray-900">
                ¥{(c.total_fee - c.retainer_fee).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 調査期間 */}
        {(c.start_date || c.due_date) && (
          <div className="text-sm text-gray-600 mb-10 space-y-1">
            {c.start_date && (
              <p>調査開始日：{new Date(c.start_date).toLocaleDateString('ja-JP')}</p>
            )}
            {c.due_date && (
              <p>調査完了日：{new Date(c.due_date).toLocaleDateString('ja-JP')}</p>
            )}
          </div>
        )}

        {/* 備考 */}
        {c.notes && (
          <div className="border-t border-gray-200 pt-6 mb-10">
            <p className="text-xs font-semibold text-gray-500 mb-2">備考</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.notes}</p>
          </div>
        )}

        {/* フッター（事務所情報スペース） */}
        <div className="border-t border-gray-200 pt-6 mt-12 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">お振込先</p>
          <p className="text-gray-400 text-xs">※ 事務所情報は設定画面から変更できます（フェーズ②）</p>
        </div>
      </div>
    </>
  )
}
