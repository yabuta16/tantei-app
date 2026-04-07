'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
    >
      印刷 / PDFで保存
    </button>
  )
}
