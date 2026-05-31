import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPlacePhoto } from '../api/unsplash'
import API from '../api/axios'

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <span style={{
            fontSize: '24px',
            color: star <= (hovered || value) ? '#fbbf24' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.15s'
          }}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function DestinationModal({ dest, onClose, onUpdate, onDelete }) {
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({
    notes: dest.notes || '',
    status: dest.status || 'wishlist',
    rating: dest.rating || 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getPlacePhoto(`${dest.name} ${dest.country}`).then(setPhoto)
  }, [dest.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await API.patch(`/destinations/${dest.id}`, form)
      onUpdate(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await API.delete(`/destinations/${dest.id}`)
      onDelete(dest.id)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: '#0d0905', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Photo header */}
        <div className="relative h-52 overflow-hidden">
          {photo
            ? <img src={photo} alt={dest.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}>🌍</div>
          }
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #0d0905 0%, rgba(13,9,5,0.4) 50%, transparent 100%)' }} />

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
            ✕
          </button>

          {/* Title over photo */}
          <div className="absolute bottom-4 left-5">
            <h2 className="text-white text-2xl font-bold">{dest.name}</h2>
            <p className="text-white/50 text-sm mt-0.5">📍 {dest.country}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">

          {/* Status toggle */}
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['wishlist', 'visited'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className="py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200"
                  style={{
                    background: form.status === s
                      ? s === 'visited' ? 'rgba(78,205,196,0.2)' : 'rgba(193,68,14,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: form.status === s
                      ? s === 'visited' ? '1px solid rgba(78,205,196,0.4)' : '1px solid rgba(193,68,14,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: form.status === s
                      ? s === 'visited' ? '#4ecdc4' : '#f4a87c'
                      : 'rgba(255,255,255,0.4)'
                  }}>
                  {s === 'wishlist' ? '🌟 Wishlist' : '✅ Visited'}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
              Rating {form.rating > 0 && <span className="text-yellow-400 normal-case ml-1">({form.rating}/5)</span>}
            </label>
            <StarRating value={form.rating} onChange={r => setForm({ ...form, rating: r })} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="What do you love about this place? Any tips?"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none resize-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          {/* Coordinates */}
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/25 text-xs">Latitude</p>
              <p className="text-white/50 text-xs font-mono mt-0.5">{parseFloat(dest.latitude).toFixed(4)}</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/25 text-xs">Longitude</p>
              <p className="text-white/50 text-xs font-mono mt-0.5">{parseFloat(dest.longitude).toFixed(4)}</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/25 text-xs">Added</p>
              <p className="text-white/50 text-xs mt-0.5">
                {new Date(dest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: saved ? '#4ecdc4' : '#c1440e' }}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Saving...
                </>
              ) : saved ? '✓ Saved!' : 'Save changes'}
            </motion.button>

            <motion.button
              onClick={handleDelete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              🗑️
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}