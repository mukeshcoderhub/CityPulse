
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../utils/auth'

const Signup = () => {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await signup({ name, mobile, password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Unable to create account.')
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
          Join CityPulse
        </h1>
        <p className="mt-2 text-sm text-[#737873]">
          Create an account and make your voice heard.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={80}
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none focus:border-[#202522]"
              required
            />
          </div>

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
              placeholder="10-digit mobile number"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none focus:border-[#202522]"
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
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none focus:border-[#202522]"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Enter password again"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none focus:border-[#202522]"
              required
            />
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#737873]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#202522] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Signup
