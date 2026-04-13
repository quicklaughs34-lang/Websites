function ArticlePage({ article }) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Blog Article</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm font-medium text-slate-500">{article.readTime}</p>
      <p className="mt-5 text-base leading-7 text-slate-600">{article.description}</p>

      <article className="mt-8 space-y-5 text-[15px] leading-8 text-slate-700 sm:text-base">
        {article.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>
    </section>
  )
}

export default ArticlePage
