function ModeToggle({ mode, onChange }) {
  const options = [
    { value: 'add', label: 'Add GST', hint: 'Exclusive to inclusive' },
    { value: 'remove', label: 'Remove GST', hint: 'Inclusive to exclusive' },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isActive = mode === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-4 text-left transition duration-300 ${
              isActive
                ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'border-slate-200 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <span className="block text-base font-semibold">{option.label}</span>
            <span className={`mt-1 block text-sm ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
              {option.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ModeToggle
