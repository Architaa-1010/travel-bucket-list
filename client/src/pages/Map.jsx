import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import { getPlacePhoto } from '../api/unsplash'
import { useNavigate } from 'react-router-dom'
import DestinationModal from '../components/DestinationModal'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createCustomIcon = (status, isNew = false) => L.divIcon({
  className: '',
  html: `<div style="
    width:24px;height:24px;
    background:${status === 'visited' ? '#4ecdc4' : '#c1440e'};
    border:2px solid white;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);
    animation:${isNew ? 'pinPop 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none'};
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

const FlyTo = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 6, { duration: 1.8 })
  }, [coords])
  return null
}

const MapClickHandler = ({ onClick }) => {
  useMapEvents({ click: (e) => onClick(e.latlng) })
  return null
}

const MapControls = () => {
  const map = useMap()
  const controlsRef = useRef(null)
  useEffect(() => {
    if (controlsRef.current) L.DomEvent.disableClickPropagation(controlsRef.current)
  }, [])
  return (
    <div ref={controlsRef}
      className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
      style={{ zIndex: 9999 }}>
      <button onClick={() => map.zoomIn()}
        className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(13,9,5,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>+</button>
      <button onClick={() => map.setView([20, 0], 2)}
        className="px-4 h-10 rounded-xl text-white text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        style={{ background: 'rgba(13,9,5,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>🌍 Reset</button>
      <button onClick={() => map.zoomOut()}
        className="w-10 h-10 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(13,9,5,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>−</button>
    </div>
  )
}

const DestinationCard = ({ dest, isSelected, onClick, index = 0 }) => {
  const [photo, setPhoto] = useState(null)
  useEffect(() => {
    getPlacePhoto(`${dest.name} ${dest.country}`).then(setPhoto)
  }, [dest.name, dest.country])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] flex-shrink-0"
      style={{
        border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
        background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        width: '160px',
      }}
    >
      <div className="relative h-20 overflow-hidden">
        {photo
          ? <img src={photo} alt={dest.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}>🌍</div>
        }
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(13,9,5,0.85) 0%, transparent 60%)' }} />
        <div className="absolute bottom-1.5 left-2">
          <p className="text-white text-xs font-semibold leading-tight truncate w-32">{dest.name}</p>
          <p className="text-white/50 text-xs truncate w-32">{dest.country}</p>
        </div>
      </div>
    </motion.div>
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
  const [filter, setFilter] = useState('all')
  const [modalDest, setModalDest] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchDestinations()
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const handleShare = () => {
  navigator.clipboard.writeText(`${window.location.origin}/user/${user?.username}`)
  setToast('🔗 Profile link copied!')
  setTimeout(() => setToast(null), 3000)
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

  const handleUpdate = (updated) => {
    setDestinations(prev => prev.map(d => d.id === updated.id ? updated : d))
    setModalDest(updated)
  }

  const flyTo = (dest) => {
    setFlyToCoords([parseFloat(dest.latitude), parseFloat(dest.longitude)])
    setSelectedDest(dest)
  }

  const filtered = destinations.filter(d => filter === 'all' || d.status === filter)
  const visited = destinations.filter(d => d.status === 'visited').length
  const wishlist = destinations.filter(d => d.status === 'wishlist').length

  return (
    <div className="w-screen h-screen bg-[#0d0905] flex flex-col md:flex-row overflow-hidden relative">

      {/* DESKTOP SIDEBAR */}
      <AnimatePresence>
        {showSidebar && !isMobile && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 h-full flex flex-col z-20 relative flex-shrink-0"
            style={{ background: 'rgba(13,9,5,0.97)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-white font-bold text-lg">🧭 Travel Map</h1>
                  <p className="text-white/40 text-xs mt-0.5">Hey, {user?.username}!</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate('/stats')}
                    className="text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    📊 Stats
                  </button>
                  <button onClick={handleShare}
  className="text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
  🔗
</button>
                  <button onClick={logout}
                    className="text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
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

              <div className="flex gap-1.5">
                {['all', 'wishlist', 'visited'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-200"
                    style={{
                      background: filter === f ? f === 'visited' ? 'rgba(78,205,196,0.15)' : f === 'wishlist' ? 'rgba(193,68,14,0.15)' : 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      color: filter === f ? f === 'visited' ? '#4ecdc4' : f === 'wishlist' ? '#f4a87c' : 'white' : 'rgba(255,255,255,0.3)',
                      border: filter === f ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-white/30 text-sm">
                    {destinations.length === 0
                      ? 'Click anywhere on the map to pin your first destination!'
                      : `No ${filter} destinations yet.`}
                  </p>
                </div>
              ) : (
                filtered.map((dest, index) => (
                  <DestinationCard
                    key={dest.id}
                    dest={dest}
                    index={index}
                    isSelected={selectedDest?.id === dest.id}
                    onClick={() => { flyTo(dest); setModalDest(dest) }}
                  />
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5">
              <p className="text-white/20 text-xs text-center">🖱️ Click anywhere on the map to pin a destination</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP toggle button */}
      {!isMobile && (
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 z-30 text-white/60 hover:text-white transition-all duration-200 rounded-xl p-2"
          style={{
            left: showSidebar ? '312px' : '12px',
            background: 'rgba(13,9,5,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'left 0.3s ease',
            zIndex: 9999,
          }}
        >
          {showSidebar ? '◀' : '▶'}
        </button>
      )}

      {/* MAP */}
      <div className="flex-1 h-full">
        <MapContainer center={[20, 0]} zoom={2}
          style={{ width: '100%', height: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <MapClickHandler onClick={handleMapClick} />
          <MapControls />
          {flyToCoords && <FlyTo coords={flyToCoords} />}
          {destinations.map((dest, i) => (
            <Marker
              key={dest.id}
              position={[parseFloat(dest.latitude), parseFloat(dest.longitude)]}
              icon={createCustomIcon(dest.status, i === 0)}
              eventHandlers={{ click: () => { setSelectedDest(dest); setModalDest(dest) } }}
            />
          ))}
        </MapContainer>
      </div>

      {/* MOBILE BOTTOM BAR */}
      {/* MOBILE BOTTOM BAR */}
{isMobile && (
  <div className="flex-shrink-0 z-20"
    style={{ background: 'rgba(13,9,5,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>

    {/* Horizontal scroll cards */}
    {destinations.length > 0 && (
      <div className="flex gap-3 px-4 pt-3 pb-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}>
        {destinations.map((dest, index) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            index={index}
            isSelected={selectedDest?.id === dest.id}
            onClick={() => { flyTo(dest); setModalDest(dest) }}
          />
        ))}
      </div>
    )}

    {/* Bottom action bar */}
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-white text-sm font-bold">🧭 {user?.username}</p>
        <p className="text-white/30 text-xs">{destinations.length} destinations · tap map to pin</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/stats')}
          className="text-white/50 hover:text-white text-xs px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          📊 Stats
        </button>
        <button onClick={handleShare}
  className="text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
  🔗
</button>
        <button onClick={logout}
          className="text-white/50 hover:text-white text-xs px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Logout
        </button>
      </div>
    </div>
  </div>
)}
          

      {/* ADD DESTINATION MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-end md:items-center justify-center md:p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={e => e.stopPropagation()}
              className="w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6"
              style={{ background: '#0d0905', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Drag handle for mobile */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5 md:hidden"
                style={{ background: 'rgba(255,255,255,0.15)' }} />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">📍 Pin this spot</h2>
                <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <form onSubmit={handleAddDestination} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Place name</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Santorini"
                    className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Country</label>
                  <input type="text" required value={form.country}
                    onChange={e => setForm({...form, country: e.target.value})}
                    placeholder="e.g. Greece"
                    className="w-full rounded-xl px-4 py-2.5 text-white text-sm outline-none"
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
                  style={{ backgroundColor: '#c1440e' }}>
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

      {/* DESTINATION DETAIL MODAL */}
      <AnimatePresence>
        {modalDest && (
          <DestinationModal
            dest={modalDest}
            onClose={() => setModalDest(null)}
            onUpdate={handleUpdate}
            onDelete={(id) => {
              setDestinations(prev => prev.filter(d => d.id !== id))
              setModalDest(null)
              setSelectedDest(null)
            }}
          />
        )}
      </AnimatePresence>
      {/* TOAST NOTIFICATION */}
<AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium text-white"
      style={{
        background: 'rgba(78,205,196,0.15)',
        border: '1px solid rgba(78,205,196,0.3)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        whiteSpace: 'nowrap'
      }}
    >
      {toast}
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}

const SelectedDestPhoto = ({ dest }) => {
  const [photo, setPhoto] = useState(null)
  useEffect(() => {
    getPlacePhoto(`${dest.name} ${dest.country}`).then(setPhoto)
  }, [dest.id])
  return (
    <div className="relative h-32 overflow-hidden">
      {photo
        ? <img src={photo} alt={dest.name} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}>🌍</div>
      }
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(13,9,5,0.7) 0%, transparent 60%)' }} />
    </div>
  )
}