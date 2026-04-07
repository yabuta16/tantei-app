import { createClient } from '@/lib/supabase/server'
import { CaseForm } from '@/components/CaseForm'
import { notFound } from 'next/navigation'

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (!caseData) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">案件編集</h1>
      <p className="text-sm text-gray-500 font-mono">{caseData.case_number}</p>
      <CaseForm caseData={caseData} />
    </div>
  )
}
