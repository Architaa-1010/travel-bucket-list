import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import API from '../api/axios'
import Loader from '../components/Loader'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createCustomIcon = (status) => L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:${status === 'visited' ? '#4ecdc4' : '#c1440e'};
    border:2px solid white;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
}

export default function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    API.get(`/destinations/public/${username}`)
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [username])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <Loader text="Loading travel map..." />

  if (notFound) return (
    <div className="min-h-screen bg-[#0d0905] flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🗺️</div>
      <h1 className="text-white text-xl font-bold">Explorer not found</h1>
      <p className="text-white/30 text-sm">No traveller with that username exists.</p>
      <button onClick={() => navigate('/login')}
        className="text-sm px-4 py-2 rounded-xl text-white mt-2"
        style={{ background: '#c1440e' }}>
        Go to app →
      </button>
    </div>
  )

  const { user, destinations } = data
  const visited = destinations.filter(d => d.status === 'visited')
  const wishlist = destinations.filter(d => d.status === 'wishlist')
  const countries = [...new Set(destinations.map(d => d.country))].length

  return (
    <div className="min-h-screen bg-[#0d0905] text-white">

      {/* Background blobs */}
      <div className="fixed w-96 h-96 bg-orange-700 opacity-5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="fixed w-80 h-80 bg-teal-600 opacity-5 rounded-full blur-3xl bottom-0 right-0 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(13,9,5,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <span className="text-white/50 text-sm">Travel Bucket List</span>
        </div>
        <button onClick={() => navigate('/login')}
          className="text-xs px-3 py-1.5 rounded-xl text-white/50 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Create your own →
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-6 py-10 space-y-6"
      >

        {/* Profile hero */}
        <motion.div variants={itemVariants} className="text-center py-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: 'rgba(193,68,14,0.2)', border: '2px solid rgba(193,68,14,0.3)' }}>
            🧭
          </div>
          <h1 className="text-3xl font-bold text-white">{user.username}</h1>
          <p className="text-white/30 text-sm mt-2">Travel Bucket List</p>

          {/* Share button */}
          <motion.button
            onClick={handleCopyLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 text-xs px-4 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-2"
            style={{
              background: copied ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.06)',
              border: copied ? '1px solid rgba(78,205,196,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#4ecdc4' : 'rgba(255,255,255,0.5)'
            }}>
            {copied ? '✓ Link copied!' : '🔗 Share this map'}
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { emoji: '📍', value: destinations.length, label: 'Destinations' },
            { emoji: '🌍', value: countries, label: 'Countries' },
            { emoji: '✅', value: visited.length, label: 'Visited' },
            { emoji: '🌟', value: wishlist.length, label: 'Wishlist' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/30 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Map */}
        {destinations.length > 0 && (
          <motion.div variants={itemVariants}
            className="rounded-3xl overflow-hidden"
            style={{ height: '380px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {destinations.map(dest => (
                <Marker
                  key={dest.id}
                  position={[parseFloat(dest.latitude), parseFloat(dest.longitude)]}
                  icon={createCustomIcon(dest.status)}
                />
              ))}
            </MapContainer>
          </motion.div>
        )}

        {/* Destinations grid */}
        {destinations.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">
              {user.username}'s destinations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dest.status === 'visited' ? '#4ecdc4' : '#c1440e' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{dest.name}</p>
                    <p className="text-white/30 text-xs">{dest.country}</p>
                  </div>
                  {dest.rating > 0 && (
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: '11px', color: s <= dest.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>★</span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: dest.status === 'visited' ? 'rgba(78,205,196,0.15)' : 'rgba(193,68,14,0.15)',
                      color: dest.status === 'visited' ? '#4ecdc4' : '#f4a87c'
                    }}>
                    {dest.status === 'visited' ? 'Visited' : 'Wishlist'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {destinations.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-20">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-white/30">No destinations pinned yet.</p>
          </motion.div>
        )}

        {/* Footer CTA */}
        <motion.div variants={itemVariants}
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(193,68,14,0.08)', border: '1px solid rgba(193,68,14,0.15)' }}>
          <p className="text-white/50 text-sm mb-3">Want to build your own travel map?</p>
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ background: '#c1440e' }}>
            Start your journey →
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  )
}