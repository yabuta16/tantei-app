import { CaseForm } from '@/components/CaseForm'

export default function NewCasePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">新規案件登録</h1>
      <CaseForm />
    </div>
  )
}
