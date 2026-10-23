
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'

const Login = () => {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      await login(mobile, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#737873]">
          Log in to continue to your community.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium">
              Mobile number
            </label>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile number"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none transition focus:border-[#202522]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none transition focus:border-[#202522]"
              required
            />
          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[#444a45] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#202522] py-3 font-medium text-white transition hover:bg-[#383e39] disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#737873]">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#202522] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login
