import AdBanner from '../components/AdBanner'
import CalculatorCard from '../components/CalculatorCard'

function HomePage({ articles, navigate }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">GST Made Simple</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            GST calculator and practical guides for India
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Calculate GST instantly, understand tax-inclusive and tax-exclusive pricing, and read clear GST articles
            written in simple English.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/calculator')}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Open GST Calculator
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Read GST Articles
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Why this site helps</h2>
          <div className="mt-6 grid gap-4">
            {[
              'Add GST or remove GST in real time',
              'Use common GST slabs: 5%, 12%, 18%, and 28%',
              'Read useful articles before filing, billing, or pricing',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <AdBanner label="Top banner placeholder for Google AdSense" />
      <CalculatorCard />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">About This Website</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Built for clarity, not clutter</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            This website focuses on a simple workflow: enter an amount, choose a GST rate, and get results instantly.
            Alongside the calculator, we publish plain-language articles to help users understand GST basics, slabs,
            and examples without legal jargon.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Latest Articles</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Helpful GST reads</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              View all
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {articles.map((article) => (
              <button
                key={article.slug}
                type="button"
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-emerald-700">{article.readTime}</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">{article.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{article.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <AdBanner label="Bottom banner placeholder for Google AdSense" />
    </div>
  )
}

export default HomePage
