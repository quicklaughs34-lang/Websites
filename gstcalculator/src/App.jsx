import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import { articles } from './content/articles'
import ArticlePage from './pages/ArticlePage'
import BlogPage from './pages/BlogPage'
import CalculatorPage from './pages/CalculatorPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import StaticPage from './pages/StaticPage'

const staticPages = {
  '/about': {
    eyebrow: 'About Us',
    title: 'About Free GST Calculator India',
    intro:
      'Free GST Calculator India is a simple educational website built to help Indian users calculate GST quickly and understand tax-related pricing with less confusion.',
    sections: [
      {
        heading: 'What we do',
        paragraphs: [
          'We provide a free GST calculator that helps users add GST to a base amount or remove GST from a tax-inclusive amount. The website is designed for speed, clarity, and mobile use so that calculations can be done in seconds.',
          'In addition to the calculator, we publish easy-to-read GST articles in simple English. The goal is to make common GST topics understandable for freelancers, shop owners, students, and general users who need practical tax information.',
        ],
      },
      {
        heading: 'Who this website is for',
        paragraphs: [
          'This website is useful for business owners, invoice creators, accountants, online sellers, service providers, and buyers who want to check GST amounts before making decisions.',
          'We focus on practical use cases such as estimating total cost, checking inclusive bills, understanding GST slabs, and learning the basics without unnecessary jargon.',
        ],
      },
      {
        heading: 'Important note',
        paragraphs: [
          'The content on this website is provided for general educational and informational purposes. It should not be treated as legal, accounting, or tax filing advice. For classification issues, registration, compliance, or return filing matters, users should consult a qualified tax professional.',
        ],
      },
    ],
  },
  '/privacy-policy': {
    eyebrow: 'Privacy Policy',
    title: 'Privacy Policy',
    intro:
      'This Privacy Policy explains how information may be handled when you use Free GST Calculator India.',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'This website is primarily a simple calculator and informational website. We do not ask users to create accounts or submit sensitive financial records through the calculator itself.',
          'If you contact us by email, we may receive the information you include in your message, such as your name, email address, and the content of your query.',
        ],
      },
      {
        heading: 'Cookies and analytics',
        paragraphs: [
          'This website may use basic analytics tools, cookies, or similar technologies in the future to understand traffic, improve user experience, and measure content performance.',
          'If advertising services such as Google AdSense are enabled, third-party vendors may use cookies to serve ads based on your visits to this and other websites. Users should review the privacy policies of those vendors for more details.',
        ],
      },
      {
        heading: 'How information is used',
        paragraphs: [
          'Any information received through contact email may be used only to respond to messages, improve the website, or address technical or content-related issues.',
          'We do not sell personal information. We may update this policy from time to time if the website adds new features, analytics, or advertising tools.',
        ],
      },
    ],
  },
  '/terms-and-conditions': {
    eyebrow: 'Terms & Conditions',
    title: 'Terms & Conditions',
    intro:
      'These Terms & Conditions govern the use of Free GST Calculator India. By using this website, you agree to these terms.',
    sections: [
      {
        heading: 'Website use',
        paragraphs: [
          'This website is provided for general informational and calculation purposes only. While we aim to keep calculations and content accurate, we do not guarantee that all information will always be complete, current, or suitable for every individual situation.',
          'Users are responsible for verifying GST classifications, tax applicability, and compliance requirements before acting on the results shown on this website.',
        ],
      },
      {
        heading: 'No professional advice',
        paragraphs: [
          'Nothing on this website should be considered legal, financial, accounting, or tax advice. The calculator is a convenience tool, not a substitute for professional review.',
          'If a transaction or filing decision has legal or financial consequences, consult a qualified chartered accountant, tax practitioner, or legal advisor.',
        ],
      },
      {
        heading: 'External services and updates',
        paragraphs: [
          'The website may include analytics tools, advertising services, or third-party integrations in the future. Their use may be subject to separate terms and policies.',
          'We may modify or update these Terms & Conditions at any time without prior notice. Continued use of the website after changes are posted indicates acceptance of the updated terms.',
        ],
      },
    ],
  },
}

function getCurrentPath() {
  return window.location.pathname || '/'
}

function App() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    function handleRouteChange() {
      setPath(getCurrentPath())
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  useEffect(() => {
    const article = articles.find((item) => `/blog/${item.slug}` === path)
    if (path === '/') return void (document.title = 'Free GST Calculator India')
    if (path === '/calculator') return void (document.title = 'GST Calculator India')
    if (path === '/blog') return void (document.title = 'GST Blog | Free GST Calculator India')
    if (article) return void (document.title = `${article.title} | Free GST Calculator India`)
    if (path === '/contact') return void (document.title = 'Contact Us | Free GST Calculator India')
    const staticPage = staticPages[path]
    if (staticPage) return void (document.title = `${staticPage.title} | Free GST Calculator India`)
    document.title = 'Free GST Calculator India'
  }, [path])

  function navigate(nextPath) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderPage() {
    if (path === '/') return <HomePage articles={articles} navigate={navigate} />
    if (path === '/calculator') return <CalculatorPage />
    if (path === '/blog') return <BlogPage articles={articles} navigate={navigate} />
    if (path === '/contact') return <ContactPage />
    const article = articles.find((item) => `/blog/${item.slug}` === path)
    if (article) return <ArticlePage article={article} />
    const staticPage = staticPages[path]
    if (staticPage) return <StaticPage {...staticPage} />

    return (
      <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/70 p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Page Not Found</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">The page you requested is not available.</h1>
        <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Back to home
        </button>
      </section>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#99f6e4_0%,rgba(153,246,228,0.18)_20%,transparent_45%),radial-gradient(circle_at_bottom_right,#fda4af_0%,rgba(253,164,175,0.16)_18%,transparent_42%),linear-gradient(160deg,#f8fafc_0%,#e2e8f0_45%,#ecfeff_100%)]" />
      <div className="absolute -left-12 top-24 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl animate-float" />
      <div className="absolute -right-12 bottom-20 h-48 w-48 rounded-full bg-rose-300/30 blur-3xl animate-float" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <NavBar currentPath={path} navigate={navigate} />
        <div className="mt-6 flex-1">{renderPage()}</div>
        <Footer navigate={navigate} />
      </main>
      <Analytics />
    </div>
  )
}

export default App
