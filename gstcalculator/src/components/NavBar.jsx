import { useState } from 'react'

function NavBar({ currentPath, navigate }) {
  const [open, setOpen] = useState(false)
  const items = [
    { label: 'Home', path: '/' },
    { label: 'GST Calculator', path: '/calculator' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ]

  function handleNavigate(path) {
    setOpen(false)
    navigate(path)
  }

  return (
    <header className="relative z-10 mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/65 px-5 py-4 shadow-premium backdrop-blur-xl sm:px-6">
        <button type="button" onClick={() => handleNavigate('/')} className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">GST India</p>
          <p className="text-lg font-black tracking-tight text-slate-900">Free GST Calculator India</p>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {items.map((item) => {
            const active = currentPath === item.path

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          <span className="text-lg">{open ? '×' : '☰'}</span>
        </button>
      </div>

      {open ? (
        <div className="mt-3 rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-premium backdrop-blur-xl md:hidden">
          <div className="grid gap-2">
            {items.map((item) => {
              const active = currentPath === item.path

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default NavBar
