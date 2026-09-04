import { ArrowRight, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        setMessage(await signUp(email, password))
        setLoading(false)
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.')
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-editorial">
        <div className="setup-brand light">
          <div className="brand-mark">J</div>
          <span>Jobfolio</span>
        </div>
        <div>
          <p className="eyebrow">Your private application desk</p>
          <h1>Turn every application into a clear next move.</h1>
          <p>
            Roles, progress, notes and follow-ups—kept in one calm, searchable place.
          </p>
        </div>
        <blockquote>“A small system for a long and complicated search.”</blockquote>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-icon">
            <LockKeyhole size={20} />
          </div>
          <p className="eyebrow">Private workspace</p>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-description">
            {mode === 'login'
              ? 'Sign in to view and update your applications.'
              : 'Use the account you want to keep as the tracker owner.'}
          </p>
          <form onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
            </label>
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <button className="button button-primary button-wide auth-submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={16} /> : <ArrowRight size={16} />}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button
            className="auth-switch"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'signup' : 'login'))
              setError('')
              setMessage('')
            }}
          >
            {mode === 'login' ? 'First time here? Create an account' : 'Already have an account? Sign in'}
          </button>
        </div>
      </section>
    </main>
  )
}
