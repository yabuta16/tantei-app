'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Case, CASE_STATUSES, CASE_TYPES } from '@/types/case'

type FormValues = {
  case_type: string
  client_name: string
  client_kana: string
  client_phone: string
  client_email: string
  subject_name: string
  start_date: string
  due_date: string
  retainer_fee: string
  total_fee: string
  status: string
  notes: string
}

function toFormValues(c?: Case): FormValues {
  return {
    case_type: c?.case_type ?? '浮気・不倫調査',
    client_name: c?.client_name ?? '',
    client_kana: c?.client_kana ?? '',
    client_phone: c?.client_phone ?? '',
    client_email: c?.client_email ?? '',
    subject_name: c?.subject_name ?? '',
    start_date: c?.start_date ?? '',
    due_date: c?.due_date ?? '',
    retainer_fee: c?.retainer_fee ? String(c.retainer_fee) : '',
    total_fee: c?.total_fee ? String(c.total_fee) : '',
    status: c?.status ?? '相談中',
    notes: c?.notes ?? '',
  }
}

export function CaseForm({ caseData }: { caseData?: Case }) {
  const router = useRouter()
  const isEdit = !!caseData
  const [values, setValues] = useState<FormValues>(toFormValues(caseData))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(field: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const payload = {
      case_type: values.case_type,
      client_name: values.client_name,
      client_kana: values.client_kana || null,
      client_phone: values.client_phone || null,
      client_email: values.client_email || null,
      subject_name: values.subject_name || null,
      start_date: values.start_date || null,
      due_date: values.due_date || null,
      retainer_fee: values.retainer_fee ? parseInt(values.retainer_fee) : 0,
      total_fee: values.total_fee ? parseInt(values.total_fee) : 0,
      status: values.status,
      notes: values.notes || null,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('cases')
        .update(payload)
        .eq('id', caseData.id)

      if (error) {
        setError('更新に失敗しました: ' + error.message)
        setLoading(false)
        return
      }
      router.push(`/cases/${caseData.id}`)
      router.refresh()
    } else {
      // 案件番号を生成
      const { data: caseNumberData, error: fnError } = await supabase
        .rpc('generate_case_number')

      if (fnError) {
        setError('案件番号の生成に失敗しました: ' + fnError.message)
        setLoading(false)
        return
      }

      const { data: newCase, error } = await supabase
        .from('cases')
        .insert({ ...payload, case_number: caseNumberData, user_id: user.id })
        .select()
        .single()

      if (error) {
        setError('登録に失敗しました: ' + error.message)
        setLoading(false)
        return
      }
      router.push(`/cases/${newCase.id}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">基本情報</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">案件種別 *</label>
            <select
              value={values.case_type}
              onChange={set('case_type')}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス *</label>
            <select
              value={values.status}
              onChange={set('status')}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">受任日</label>
            <input
              type="date"
              value={values.start_date}
              onChange={set('start_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">完了予定日</label>
            <input
              type="date"
              value={values.due_date}
              onChange={set('due_date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </section>

      {/* 依頼人情報 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">依頼人情報</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">依頼人名 *</label>
            <input
              type="text"
              value={values.client_name}
              onChange={set('client_name')}
              required
              placeholder="山田 太郎"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">フリガナ</label>
            <input
              type="text"
              value={values.client_kana}
              onChange={set('client_kana')}
              placeholder="ヤマダ タロウ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
            <input
              type="tel"
              value={values.client_phone}
              onChange={set('client_phone')}
              placeholder="090-0000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">メールアドレス</label>
            <input
              type="email"
              value={values.client_email}
              onChange={set('client_email')}
              placeholder="example@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </section>

      {/* 調査対象者 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">調査対象者</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">対象者名</label>
          <input
            type="text"
            value={values.subject_name}
            onChange={set('subject_name')}
            placeholder="調査対象者の名前"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </section>

      {/* 費用 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">費用</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">着手金額（円）</label>
            <input
              type="number"
              value={values.retainer_fee}
              onChange={set('retainer_fee')}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">総費用（円）</label>
            <input
              type="number"
              value={values.total_fee}
              onChange={set('total_fee')}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </section>

      {/* 備考 */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm">備考</h2>
        <textarea
          value={values.notes}
          onChange={set('notes')}
          rows={4}
          placeholder="メモや特記事項を入力..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}
