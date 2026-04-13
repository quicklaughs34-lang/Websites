import CalculatorCard from '../components/CalculatorCard'

function CalculatorPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">GST Calculator</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Add or remove GST instantly
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Use this calculator for exclusive and inclusive GST calculations with the most common GST slabs in India:
          5%, 12%, 18%, and 28%.
        </p>
      </div>

      <CalculatorCard compact />
    </section>
  )
}

export default CalculatorPage
