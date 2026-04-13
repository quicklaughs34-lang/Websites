function AdBanner({ label }) {
  return (
    <div className="w-full rounded-3xl border border-white/60 bg-white/60 px-4 py-4 text-center shadow-lg shadow-slate-900/5 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        Ad Space
      </p>
      <p className="mt-2 text-sm text-slate-600">{label}</p>
      {/* Google AdSense unit can be mounted inside this container later */}
    </div>
  )
}

export default AdBanner
