function BlogPage({ articles, navigate }) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">GST Blog</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Practical GST articles for Indian users
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Read simple guides on GST basics, rates, and calculations. These articles are written in plain English
          for shop owners, freelancers, students, and anyone who wants quick clarity.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl transition hover:-translate-y-1"
          >
            <p className="text-sm font-semibold text-emerald-700">{article.readTime}</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">{article.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{article.description}</p>
            <button
              type="button"
              onClick={() => navigate(`/blog/${article.slug}`)}
              className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Read article
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BlogPage
