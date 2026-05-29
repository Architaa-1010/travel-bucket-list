import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

// Fix Leaflet default icon bug in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createCustomIcon = (status) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 24px; height: 24px;
      background: ${status === 'visited' ? '#4ecdc4' : '#c1440e'};
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

// Fly to location component
const FlyTo = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 6, { duration: 1.8 })
  }, [coords])
  return null
}

// Click handler component
const MapClickHandler = ({ onClick }) => {
  useMapEvents({ click: (e) => onClick(e.latlng) })
  return null
}

const MapControls = () => {
  const map = useMap()

  useEffect(() => {
    const container = document.querySelector('.map-controls')

    if (container) {
      L.DomEvent.disableClickPropagation(container)
      L.DomEvent.disableScrollPropagation(container)
    }
  }, [])

  return (
    <div
      className="map-controls absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
      style={{ zIndex: 9999 }}
    >
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'rgba(13,9,5,0.9)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        +
      </button>

      <button
        onClick={() => map.setView([20, 0], 2)}
        className="px-4 h-10 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(13,9,5,0.9)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        🌍 Reset view
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'rgba(13,9,5,0.9)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        −
      </button>
    </div>
  )
}

export default function Map() {
  const { user, logout } = useAuth()
  const [destinations, setDestinations] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [clickCoords, setClickCoords] = useState(null)
  const [flyToCoords, setFlyToCoords] = useState(null)
  const [form, setForm] = useState({ name: '', country: '', status: 'wishlist', notes: '' })
  const [loading, setLoading] = useState(false)
  const [selectedDest, setSelectedDest] = useState(null)

  useEffect(() => { fetchDestinations() }, [])

  const fetchDestinations = async () => {
    try {
      const res = await API.get('/destinations')
      setDestinations(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMapClick = (latlng) => {
    setClickCoords(latlng)
    setForm({ name: '', country: '', status: 'wishlist', notes: '' })
    setShowModal(true)
  }

  const handleAddDestination = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/destinations', {
        ...form,
        latitude: clickCoords.lat,
        longitude: clickCoords.lng,
      })
      setDestinations(prev => [res.data, ...prev])
      setShowModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/destinations/${id}`)
      setDestinations(prev => prev.filter(d => d.id !== id))
      setSelectedDest(null)
    } catch (err) {
      console.error(err)
    }
  }

  const flyTo = (dest) => {
    setFlyToCoords([parseFloat(dest.latitude), parseFloat(dest.longitude)])
    setSelectedDest(dest)
  }

  const visited = destinations.filter(d => d.status === 'visited').length
  const wishlist = destinations.filter(d => d.status === 'wishlist').length

  return (
    <div className="w-screen h-screen bg-[#0d0905] flex overflow-hidden relative">

      {/* SIDEBAR */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 h-full flex flex-col z-20 relative flex-shrink-0"
            style={{ background: 'rgba(13,9,5,0.97)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-white font-bold text-lg">🧭 Travel Map</h1>
                  <p className="text-white/40 text-xs mt-0.5">Hey, {user?.username}!</p>
                </div>
                <button onClick={logout} className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  Logout
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total', value: destinations.length, color: 'text-white' },
                  { label: 'Visited', value: visited, color: 'text-[#4ecdc4]' },
                  { label: 'Wishlist', value: wishlist, color: 'text-[#c1440e]' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destinations list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {destinations.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-white/30 text-sm">Click anywhere on the map to pin your first destination!</p>
                </div>
              ) : (
                destinations.map(dest => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => flyTo(dest)}
                    className="rounded-2xl p-3.5 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: selectedDest?.id === dest.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                      border: selectedDest?.id === dest.id ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: dest.status === 'visited' ? '#4ecdc4' : '#c1440e' }} />
                        <div>
                          <p className="text-white text-sm font-medium">{dest.name}</p>
                          <p className="text-white/40 text-xs mt-0.5">{dest.country}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: dest.status === 'visited' ? 'rgba(78,205,196,0.15)' : 'rgba(193,68,14,0.15)',
                          color: dest.status === 'visited' ? '#4ecdc4' : '#f4a87c'
                        }}>
                        {dest.status}
                      </span>
                    </div>
                    {dest.notes && (
                      <p className="text-white/25 text-xs mt-2 ml-5 line-clamp-1">{dest.notes}</p>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              <p className="text-white/20 text-xs text-center">🖱️ Click anywhere on the map to pin a destination</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle sidebar */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute top-4 z-30 text-white/60 hover:text-white transition-all duration-200 rounded-xl p-2"
        style={{
  left: showSidebar ? '312px' : '12px',
  background: 'rgba(13,9,5,0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'left 0.3s ease',
  zIndex: 9999
}}
      >
        {showSidebar ? '◀' : '▶'}
      </button>

      {/* MAP */}
      <div className="flex-1 h-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
/>
<MapControls />
          <MapClickHandler onClick={handleMapClick} />
          {flyToCoords && <FlyTo coords={flyToCoords} />}
          {destinations.map(dest => (
            <Marker
              key={dest.id}
              position={[parseFloat(dest.latitude), parseFloat(dest.longitude)]}
              icon={createCustomIcon(dest.status)}
              eventHandlers={{ click: () => setSelectedDest(dest) }}
            />
          ))}
        </MapContainer>
      </div>

      {/* ADD DESTINATION MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4"
style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: '#0d0905', border: '1px solid rgba(255,255,255,0.1)', zIndex: 9999 }}
              
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">📍 Pin this spot</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <form onSubmit={handleAddDestination} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Place name</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Santorini"
                    className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Country</label>
                  <input
                    type="text" required value={form.country}
                    onChange={e => setForm({...form, country: e.target.value})}
                    placeholder="e.g. Greece"
                    className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['wishlist', 'visited'].map(s => (
                      <button key={s} type="button" onClick={() => setForm({...form, status: s})}
                        className="py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200"
                        style={{
                          background: form.status === s ? s === 'visited' ? 'rgba(78,205,196,0.2)' : 'rgba(193,68,14,0.2)' : 'rgba(255,255,255,0.04)',
                          border: form.status === s ? s === 'visited' ? '1px solid rgba(78,205,196,0.4)' : '1px solid rgba(193,68,14,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          color: form.status === s ? s === 'visited' ? '#4ecdc4' : '#f4a87c' : 'rgba(255,255,255,0.4)'
                        }}>
                        {s === 'wishlist' ? '🌟 Wishlist' : '✅ Visited'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    placeholder="Any thoughts about this place..." rows={2}
                    className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#c1440e', marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Saving...
                    </>
                  ) : 'Pin this destination →'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESTINATION DETAIL POPUP */}
      <AnimatePresence>
        {selectedDest && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-8 right-8 w-72 rounded-3xl p-5"
style={{ background: '#0d0905', border: '1px solid rgba(255,255,255,0.1)', zIndex: 9999 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-base">{selectedDest.name}</h3>
                <p className="text-white/40 text-xs mt-0.5">{selectedDest.country}</p>
              </div>
              <button onClick={() => setSelectedDest(null)} className="text-white/30 hover:text-white text-lg">✕</button>
            </div>

            <span className="inline-block text-xs px-3 py-1 rounded-full capitalize mb-3"
              style={{
                background: selectedDest.status === 'visited' ? 'rgba(78,205,196,0.15)' : 'rgba(193,68,14,0.15)',
                color: selectedDest.status === 'visited' ? '#4ecdc4' : '#f4a87c'
              }}>
              {selectedDest.status === 'visited' ? '✅ Visited' : '🌟 Wishlist'}
            </span>

            {selectedDest.notes && (
              <p className="text-white/40 text-xs mb-4 leading-relaxed">{selectedDest.notes}</p>
            )}

            <button onClick={() => handleDelete(selectedDest.id)}
              className="w-full py-2 rounded-xl text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 border border-transparent hover:border-red-400/20">
              Remove destination
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}