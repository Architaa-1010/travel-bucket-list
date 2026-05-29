import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/map')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f0c29] flex items-center justify-center p-4">

      {/* Animated background blobs */}
      <div className="absolute w-72 h-72 bg-purple-600 opacity-20 rounded-full blur-3xl top-[-4rem] left-[-4rem] animate-pulse" />
      <div className="absolute w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl bottom-[-6rem] right-[-4rem] animate-pulse delay-1000" />
      <div className="absolute w-48 h-48 bg-pink-500 opacity-10 rounded-full blur-2xl top-1/2 left-1/3 animate-pulse delay-500" />

      {/* Floating emojis */}
      {/* Floating travel icons - scattered naturally */}
<div className="absolute text-5xl top-[8%] left-[12%] opacity-30 animate-bounce" style={{animationDuration:'3s'}}>🌍</div>
<div className="absolute text-2xl top-[15%] left-[40%] opacity-20 animate-bounce" style={{animationDuration:'4s', animationDelay:'0.5s'}}>⭐</div>
<div className="absolute text-4xl top-[10%] right-[15%] opacity-25 animate-bounce" style={{animationDuration:'2.5s', animationDelay:'1s'}}>✈️</div>
<div className="absolute text-2xl top-[35%] left-[6%] opacity-20 animate-bounce" style={{animationDuration:'5s', animationDelay:'0.3s'}}>🧭</div>
<div className="absolute text-3xl top-[40%] right-[8%] opacity-25 animate-bounce" style={{animationDuration:'3.5s', animationDelay:'1.5s'}}>🏔️</div>
<div className="absolute text-xl top-[60%] left-[20%] opacity-20 animate-bounce" style={{animationDuration:'4.5s', animationDelay:'0.8s'}}>📍</div>
<div className="absolute text-4xl bottom-[20%] right-[12%] opacity-30 animate-bounce" style={{animationDuration:'3s', animationDelay:'0.2s'}}>🌴</div>
<div className="absolute text-2xl bottom-[15%] left-[8%] opacity-20 animate-bounce" style={{animationDuration:'4s', animationDelay:'1.2s'}}>🧳</div>
<div className="absolute text-xl bottom-[30%] right-[30%] opacity-15 animate-bounce" style={{animationDuration:'5s', animationDelay:'0.6s'}}>🗺️</div>
<div className="absolute text-3xl bottom-[8%] left-[45%] opacity-20 animate-bounce" style={{animationDuration:'3.8s', animationDelay:'0.9s'}}>🚢</div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🌍</div>
            <h1 className="text-3xl font-bold text-white">Travel Bucket List</h1>
            <p className="text-white/60 mt-2 text-sm">Start planning your adventures</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-200"
                placeholder="yourname"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}