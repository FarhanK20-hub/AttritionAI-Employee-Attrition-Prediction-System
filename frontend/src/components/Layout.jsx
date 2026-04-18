import { useLocation, Link } from 'react-router-dom'
import { Brain, UploadCloud, BarChart3 } from 'lucide-react'

export default function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isDash = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0078D4]">
              <Brain size={18} color="white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                AttritionAI
              </h1>
              <p className="text-[9px] text-[#6B7280] font-semibold tracking-widest uppercase mt-0.5">
                Employee Risk Analytics
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link to="/"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors no-underline ${
                isHome
                  ? 'bg-[#0078D4]/10 text-[#3B9AE8]'
                  : 'text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.03]'
              }`}>
              <UploadCloud size={15} />
              Upload
            </Link>
            <Link to="/dashboard"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors no-underline ${
                isDash
                  ? 'bg-[#0078D4]/10 text-[#3B9AE8]'
                  : 'text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.03]'
              }`}>
              <BarChart3 size={15} />
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-4">
        <p className="text-center text-[11px] text-[#374151] font-medium">
          AttritionAI — Enterprise HR Analytics • Tata Motors Internship Project
        </p>
      </footer>
    </div>
  )
}
