import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const FloatingInput = ({ label, type, name, value, onChange, required }) => {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div className="relative mt-6">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-b-2 border-white/20 focus:border-indigo-400 outline-none py-2 text-white text-sm transition-all duration-300 peer"
      />
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none
          ${active
            ? '-top-4 text-xs text-indigo-400 font-medium tracking-widest uppercase'
            : 'top-2 text-sm text-white/40'
          }`}
      >
        {label}
      </label>
      <div className={`absolute bottom-0 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
    </div>
  )
}

const Globe = () => (
  <svg viewBox="0 0 200 200" className="w-64 h-64 opacity-80">
    <defs>
      <radialGradient id="globeGrad" cx="40%" cy="35%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#globeGrad)" />
    <ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
    <ellipse cx="100" cy="100" rx="90" ry="55" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
    <ellipse cx="100" cy="100" rx="90" ry="75" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
    <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
    <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
    {/* Continents (simplified blobs) */}
    <ellipse cx="80" cy="75" rx="22" ry="15" fill="white" fillOpacity="0.15" />
    <ellipse cx="120" cy="85" rx="28" ry="18" fill="white" fillOpacity="0.12" />
    <ellipse cx="95" cy="115" rx="18" ry="12" fill="white" fillOpacity="0.1" />
    <ellipse cx="135" cy="110" rx="14" ry="10" fill="white" fillOpacity="0.08" />
    <ellipse cx="65" cy="105" rx="10" ry="8" fill="white" fillOpacity="0.1" />
    {/* Glow ring */}
    <circle cx="100" cy="100" r="90" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" />
    {/* Dots (cities) */}
    <circle cx="80" cy="72" r="2" fill="#f472b6" fillOpacity="0.9" />
    <circle cx="118" cy="82" r="2" fill="#34d399" fillOpacity="0.9" />
    <circle cx="100" cy="112" r="2" fill="#fbbf24" fillOpacity="0.9" />
    <circle cx="140" cy="107" r="1.5" fill="#f472b6" fillOpacity="0.9" />
    <circle cx="62" cy="100" r="1.5" fill="#34d399" fillOpacity="0.9" />
  </svg>
)

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setForm({ username: '', email: '', password: '' })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const res = await API.post(endpoint, form)
      login(res.data.user, res.data.token)
      navigate('/map')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080618] flex overflow-hidden">

      {/* ---- LEFT PANEL ---- */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent" />
        <div className="absolute w-96 h-96 bg-indigo-600 opacity-10 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-80 h-80 bg-purple-600 opacity-10 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{animationDelay:'1.5s'}} />

        {/* Vertical dashed line divider */}
        <div className="absolute right-0 top-0 h-full w-px border-r border-dashed border-white/10" />

        <div className="relative z-10 text-center">

          {/* Rotating globe wrapper */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="mb-8 mx-auto w-fit"
          >
            <Globe />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4 leading-tight"
          >
            The world is <br />
            <span className="text-indigo-400">yours to explore.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto"
          >
            Pin destinations, track adventures, and share your travel story with the world.
          </motion.p>

          {/* Floating stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 justify-center mt-8 flex-wrap"
          >
            {['195 Countries', '7 Continents', 'Infinite Adventures'].map((tag, i) => (
              <span key={i} className="text-xs bg-white/5 border border-white/10 text-white/50 px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ---- RIGHT PANEL ---- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">

        {/* Subtle bg for right side */}
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/10 to-transparent pointer-events-none" />

        <div className="w-full max-w-sm relative z-10">

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl mb-10 text-center"
          >
            🧭
          </motion.div>

          {/* Tab switcher */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-10 border border-white/10">
            {['Log in', 'Sign up'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setIsLogin(i === 0)}
                className="relative flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 z-10"
                style={{ color: (isLogin && i === 0) || (!isLogin && i === 1) ? 'white' : 'rgba(255,255,255,0.35)' }}
              >
                {(isLogin && i === 0) || (!isLogin && i === 1) ? (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                ) : null}
                {tab}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-2"
            >
              {!isLogin && (
                <FloatingInput
                  label="Username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              )}

              <FloatingInput
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <FloatingInput
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs pt-2"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                style={{ marginTop: '2.5rem' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>{isLogin ? 'Continue your journey' : 'Start exploring'} →</>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <p className="text-center text-xs text-white/20 mt-8">
            By continuing you agree to our terms of adventure ✈️
          </p>
        </div>
      </div>
    </div>
  )
}