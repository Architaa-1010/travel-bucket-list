import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import { getContinentFromCountry, CONTINENT_COLORS } from '../utils/continents'

// Animated counter
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) { clearInterval(timer); return target }
        return prev + step
      })
    }, 30)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count}{suffix}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-sm"
        style={{ background: '#1a1208', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/60 text-xs mb-1">{label}</p>
        <p className="text-white font-medium">{payload[0].value} destinations</p>
      </div>
    )
  }
  return null
}

export default function Stats() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/destinations').then(res => {
      setDestinations(res.data)
      setLoading(false)
    })
  }, [])

  // Compute stats
  const visited = destinations.filter(d => d.status === 'visited')
  const wishlist = destinations.filter(d => d.status === 'wishlist')
  const countries = [...new Set(destinations.map(d => d.country))].length
  const worldPercent = parseFloat(((countries / 195) * 100).toFixed(1))

  // Continent breakdown
  const continentMap = {}
  destinations.forEach(d => {
    const c = getContinentFromCountry(d.country)
    continentMap[c] = (continentMap[c] || 0) + 1
  })
  const continentData = Object.entries(continentMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Pie data
  const pieData = [
    { name: 'Visited', value: visited.length },
    { name: 'Wishlist', value: wishlist.length },
  ].filter(d => d.value > 0)

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-[#0d0905] text-white overflow-y-auto">

      {/* Background blobs */}
      <div className="fixed w-96 h-96 bg-orange-700 opacity-5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="fixed w-80 h-80 bg-teal-600 opacity-5 rounded-full blur-3xl bottom-0 right-0 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(13,9,5,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/map')}
            className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            ← Map
          </button>
          <span className="text-white/20">|</span>
          <h1 className="text-white font-bold">📊 Your Travel Stats</h1>
        </div>
        <p className="text-white/30 text-xs">Hey, {user?.username}!</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white/30 text-sm">Loading your adventures...</div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-5xl">🗺️</div>
          <p className="text-white/30 text-sm">Pin some destinations first to see your stats!</p>
          <button onClick={() => navigate('/map')}
            className="text-sm px-4 py-2 rounded-xl text-white transition-colors"
            style={{ background: '#c1440e' }}>
            Go to map →
          </button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto px-6 py-8 space-y-6"
        >

          {/* Top stat cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total destinations', value: destinations.length, suffix: '', color: 'text-white', emoji: '📍' },
              { label: 'Countries visited', value: countries, suffix: '', color: 'text-[#4ecdc4]', emoji: '🌍' },
              { label: 'Places visited', value: visited.length, suffix: '', color: 'text-[#4ecdc4]', emoji: '✅' },
              { label: 'World explored', value: worldPercent, suffix: '%', color: 'text-[#fbbf24]', emoji: '🔭' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-2xl mb-2">{stat.emoji}</div>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/30 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Visited vs Wishlist breakdown */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pie chart */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">Visited vs Wishlist</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="value">
                    <Cell fill="#4ecdc4" />
                    <Cell fill="#c1440e" />
                  </Pie>
                  <Legend
                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{value}</span>}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Progress bars */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">Breakdown</h2>
              <div className="space-y-4 mt-2">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/50">Visited</span>
                    <span style={{ color: '#4ecdc4' }}>{visited.length}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: destinations.length ? `${(visited.length / destinations.length) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: '#4ecdc4' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/50">Wishlist</span>
                    <span style={{ color: '#c1440e' }}>{wishlist.length}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: destinations.length ? `${(wishlist.length / destinations.length) * 100}%` : '0%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: '#c1440e' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/50">World explored</span>
                    <span style={{ color: '#fbbf24' }}>{worldPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${worldPercent}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: '#fbbf24' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bar chart — by continent */}
          {continentData.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-6">Destinations by continent</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={continentData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {continentData.map((entry) => (
                      <Cell key={entry.name} fill={CONTINENT_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Destination list by continent */}
          {continentData.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">Countries on your list</h2>
              <div className="flex flex-wrap gap-2">
                {[...new Set(destinations.map(d => d.country))].map(country => (
                  <span key={country}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                    {country}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

        </motion.div>
      )}
    </div>
  )
}