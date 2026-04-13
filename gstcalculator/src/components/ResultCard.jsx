function ResultCard({ title, value, icon, highlight = false }) {
  return (
    <div
      className={`rounded-3xl border px-5 py-5 transition duration-300 ${
        highlight
          ? 'border-emerald-200 bg-emerald-50/90 shadow-lg shadow-emerald-500/10'
          : 'border-slate-200 bg-white/80'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            highlight ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
