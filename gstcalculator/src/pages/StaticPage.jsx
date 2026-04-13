function StaticPage({ eyebrow, title, intro, sections }) {
  return (
    <section className="mx-auto w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{intro}</p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <div key={section.heading} className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-900">{section.heading}</h2>
            <div className="mt-3 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StaticPage
