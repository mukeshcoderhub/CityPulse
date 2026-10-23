
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUsers, resetPassword } from '../utils/auth'

const ForgotPassword = () => {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!getUsers().some(user => user.mobile === mobile)) {
      setError('No account found with this mobile number.')
      return
    }

    if (password.length < 8) {
      setError('New password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(mobile, password)
      setSuccess('Password updated. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message || 'Unable to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-68px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5e0] bg-white p-7 sm:p-9">
        <Link to="/login" className="text-sm text-[#626762] hover:text-[#202522]">
          ← Back to login
        </Link>

        <h1 className="mt-7 text-3xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-[#737873]">
          Enter your registered mobile number and choose a new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="mobile" className="mb-2 block text-sm font-medium">
              Registered mobile number
            </label>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              className="w-full rounded-lg border border-[#deded8] px-4 py-3 outline-none focus:border-[#202522]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              New password
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
              Confirm new password
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

          {success && (
            <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-lg bg-[#202522] py-3 font-medium text-white transition hover:bg-[#383e39] disabled:opacity-60"
          >
            {loading ? 'Updating password...' : 'Reset password'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default ForgotPassword
