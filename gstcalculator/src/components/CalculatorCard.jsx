import { useState } from 'react'
import ModeToggle from './ModeToggle'
import ResultCard from './ResultCard'
import { calculateGst, formatCurrency } from '../utils/gst'

const GST_OPTIONS = [5, 12, 18, 28]

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5A2.5 2.5 0 0 1 5.5 6h11A2.5 2.5 0 0 1 19 8.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 13h5v-3a2 2 0 0 0-2-2h-2" />
      <circle cx="16.5" cy="11.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 15 .8 1.8L21.5 18l-1.7.8L19 20.5l-.8-1.7L16.5 18l1.7-.7L19 15ZM5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
    </svg>
  )
}

function CalculatorCard({ compact = false }) {
  const [amount, setAmount] = useState('')
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState('add')
  const numericAmount = Number(amount)
  const isValidAmount = amount !== '' && Number.isFinite(numericAmount) && numericAmount >= 0
  const { gstAmount, finalAmount } = calculateGst(numericAmount, gstRate, mode)
  const amountLabel = mode === 'add' ? 'Final Amount' : 'Base Amount'
  const helperText = mode === 'add'
    ? 'Enter a pre-tax amount to see the GST-inclusive total instantly.'
    : 'Enter a GST-inclusive amount to extract the base price instantly.'

  function handleReset() {
    setAmount('')
    setGstRate(18)
    setMode('add')
  }

  return (
    <div className="grid w-full items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          <SparkIcon />
          Free GST Calculator India
        </div>
        <h1 className={`mt-4 font-black tracking-tight text-slate-900 ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>Calculate GST in seconds.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Add or remove GST with a premium, mobile-first calculator built for quick daily use.</p>
        <div className="mt-8 space-y-6">
          <ModeToggle mode={mode} onChange={setMode} />
          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Amount</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">{'\u20B9'}</span>
                <input type="number" min="0" step="0.01" inputMode="decimal" placeholder={mode === 'add' ? 'Enter amount before GST' : 'Enter amount including GST'} value={amount} onChange={(event) => setAmount(event.target.value)} className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-base font-medium text-slate-900 shadow-sm outline-none transition duration-300 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
              </div>
              {!isValidAmount && amount !== '' ? <span className="mt-2 block text-sm font-medium text-rose-500">Please enter a valid non-negative amount.</span> : <span className="mt-2 block text-sm text-slate-500">{helperText}</span>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">GST Rate</span>
              <select value={gstRate} onChange={(event) => setGstRate(Number(event.target.value))} className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 shadow-sm outline-none transition duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
                {GST_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}% GST</option>
                ))}
              </select>
            </label>
          </div>
          <button type="button" onClick={handleReset} className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0">Reset Calculator</button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-premium backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Live Result</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Instant GST breakdown</h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30">
            <ReceiptIcon />
          </div>
        </div>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm leading-6 text-slate-600">{mode === 'add' ? 'Exclusive amount + GST = total payable amount.' : 'Inclusive amount - GST = base amount before tax.'}</p>
        </div>
        <div className={`mt-6 space-y-4 ${isValidAmount ? 'animate-fade-up' : ''}`}>
          <ResultCard title="GST Amount" value={isValidAmount ? formatCurrency(gstAmount) : '\u20B90.00'} icon={<ReceiptIcon />} />
          <ResultCard title={amountLabel} value={isValidAmount ? formatCurrency(finalAmount) : '\u20B90.00'} icon={<WalletIcon />} highlight />
        </div>
        <div className="mt-6 rounded-3xl bg-slate-900 px-5 py-4 text-white">
          <p className="text-sm text-slate-300">Selected Mode</p>
          <p className="mt-1 text-lg font-semibold">{mode === 'add' ? 'Add GST to amount' : 'Remove GST from amount'}</p>
          <p className="mt-2 text-sm text-slate-300">Current rate: {gstRate}%</p>
        </div>
      </div>
    </div>
  )
}

export default CalculatorCard
