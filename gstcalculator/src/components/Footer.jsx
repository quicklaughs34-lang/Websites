function Footer({ navigate }) {
  const links = [
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms & Conditions', path: '/terms-and-conditions' },
  ]

  return (
    <footer className="relative mx-auto mt-10 w-full max-w-6xl rounded-[2rem] border border-white/70 bg-white/60 px-6 py-8 shadow-premium backdrop-blur-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-black tracking-tight text-slate-900">Free GST Calculator India</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Simple GST calculation tools and practical tax guides for Indian users, freelancers, and small businesses.
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm font-medium text-slate-600">
        {'Made with \u2764\uFE0F'}
      </div>
    </footer>
  )
}

export default Footer
