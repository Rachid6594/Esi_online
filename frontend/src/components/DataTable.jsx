import { useState } from 'react'

export default function DataTable({ columns, data, pageSize = 10, sortable = true }) {
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const handleSort = (col) => {
    if (!sortable) return
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  let sorted = [...data]
  if (sortBy) {
    sorted.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1
      if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-600">
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 cursor-pointer select-none"
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortable && sortBy === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, i) => (
            <tr key={row.id || i} className="border-b border-slate-100">
              {columns.map((col) => (
                <td key={col.key} className="py-2">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-2">
        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 rounded border text-xs disabled:opacity-50">Préc.</button>
        <span className="text-xs">Page {page} / {totalPages || 1}</span>
        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 rounded border text-xs disabled:opacity-50">Suiv.</button>
      </div>
    </div>
  )
}
