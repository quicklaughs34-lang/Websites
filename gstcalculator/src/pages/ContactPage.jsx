function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-premium backdrop-blur-xl sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Contact Us</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Get in touch</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
        If you have feedback about the calculator, want to report an error, or need to discuss content updates, you
        can contact us using the details below.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-900">Email</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            General queries:{' '}
            <a className="font-semibold text-emerald-700" href="mailto:quicklaughs34@gmail.com">
              quicklaughs34@gmail.com
            </a>
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">Response time is usually within 2 to 5 business days.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-900">Use of this website</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This website is intended for educational and estimation purposes. If you need legal, tax, or filing advice,
            consult a qualified professional before acting on any calculation.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
