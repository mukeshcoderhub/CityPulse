
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Your browser blocked the sign-in popup. Allow popups and try again.')
      } else {
        setError('Google sign-in failed. Please try again.')
        console.error('Google sign-in error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5e0] bg-white p-7 sm:p-9">
        <Link to="/" className="text-sm text-[#626762] hover:text-[#202522]">
          ← Back to CityPulse
        </Link>

        <h1 className="mt-7 text-3xl font-semibold tracking-tight">
          Welcome to CityPulse
        </h1>

        <p className="mt-2 text-sm text-[#737873]">
          Sign in to report city problems and help your community.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-[#deded8] bg-white py-3 font-medium text-[#202522] transition hover:bg-[#f7f7f4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="h-5 w-5"
          >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.01 46.98 31.91 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.94l-7.98 6.19C6.51 43.62 14.62 48 24 48Z" />
          </svg>

          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-[#737873]">
          By continuing, you agree to use CityPulse responsibly and help
          build a better community.
        </p>
      </div>
    </main>
  )
}

export default Login
