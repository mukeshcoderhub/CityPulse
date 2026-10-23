
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../utils/auth'

const Navbar = () => {
  const [user, setUser] = useState(getCurrentUser)
  const navigate = useNavigate()

  useEffect(() => {
    const updateUser = () => setUser(getCurrentUser())

    window.addEventListener('citypulse-auth-change', updateUser)
    window.addEventListener('storage', updateUser)

    return () => {
      window.removeEventListener('citypulse-auth-change', updateUser)
      window.removeEventListener('storage', updateUser)
    }
  }, [])

  const handleAccount = () => {
    if (user) {
      logout()
      navigate('/')
    } else {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e5e0] bg-[#f7f7f5]">
      <nav className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202522] text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>

          <span className="text-lg font-semibold tracking-tight">
            CityPulse
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm text-[#626762] transition hover:text-[#202522]"
          >
            Explore
          </Link>

          <a
            href="#about"
            className="text-sm text-[#626762] transition hover:text-[#202522]"
          >
            About
          </a>
        </div>

        <button
          onClick={handleAccount}
          className="rounded-lg bg-[#202522] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#383e39]"
        >
          {user ? `Logout · ${user.name.split(' ')[0]}` : 'Login'}
        </button>
      </nav>
    </header>
  )
}

export default Navbar
