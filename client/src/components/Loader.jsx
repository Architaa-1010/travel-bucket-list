import { motion } from 'framer-motion'

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-[#0d0905] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="text-4xl"
      >
        🧭
      </motion.div>
      <p className="text-white/30 text-sm">{text}</p>
    </div>
  )
}