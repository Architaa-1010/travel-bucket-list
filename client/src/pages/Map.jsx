import { useAuth } from '../context/AuthContext'

export default function Map() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f0c29] flex flex-col items-center justify-center p-4">

      {/* Background blobs */}
      <div className="absolute w-96 h-96 bg-purple-600 opacity-20 rounded-full blur-3xl top-[-6rem] left-[-6rem] animate-pulse" />
      <div className="absolute w-80 h-80 bg-indigo-500 opacity-20 rounded-full blur-3xl bottom-[-4rem] right-[-4rem] animate-pulse" style={{animationDelay:'1s'}} />
      <div className="absolute w-64 h-64 bg-pink-500 opacity-10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse" style={{animationDelay:'2s'}} />

      {/* Floating icons */}
      <div className="absolute text-5xl top-[8%] left-[12%] opacity-30 animate-bounce" style={{animationDuration:'3s'}}>🌍</div>
      <div className="absolute text-2xl top-[15%] left-[40%] opacity-20 animate-bounce" style={{animationDuration:'4s', animationDelay:'0.5s'}}>⭐</div>
      <div className="absolute text-4xl top-[10%] right-[15%] opacity-25 animate-bounce" style={{animationDuration:'2.5s', animationDelay:'1s'}}>✈️</div>
      <div className="absolute text-2xl top-[35%] left-[6%] opacity-20 animate-bounce" style={{animationDuration:'5s', animationDelay:'0.3s'}}>🧭</div>
      <div className="absolute text-3xl top-[40%] right-[8%] opacity-25 animate-bounce" style={{animationDuration:'3.5s', animationDelay:'1.5s'}}>🏔️</div>
      <div className="absolute text-4xl bottom-[20%] right-[12%] opacity-30 animate-bounce" style={{animationDuration:'3s', animationDelay:'0.2s'}}>🌴</div>
      <div className="absolute text-2xl bottom-[15%] left-[8%] opacity-20 animate-bounce" style={{animationDuration:'4s', animationDelay:'1.2s'}}>🧳</div>
      <div className="absolute text-3xl bottom-[8%] left-[45%] opacity-20 animate-bounce" style={{animationDuration:'3.8s', animationDelay:'0.9s'}}>🚢</div>

      {/* Main content card */}
      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-indigo-600/50 border-2 border-indigo-400/50 flex items-center justify-center text-3xl mx-auto mb-6">
            🧭
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            Hey, {user?.username}! 👋
          </h1>
          <p className="text-white/50 text-sm mb-8">
            Your interactive travel map is coming on Day 5. <br />
            You're building something really cool.
          </p>

          {/* Fake stats preview */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-indigo-400">0</div>
              <div className="text-xs text-white/40 mt-1">Destinations</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-pink-400">0</div>
              <div className="text-xs text-white/40 mt-1">Countries</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-purple-400">0%</div>
              <div className="text-xs text-white/40 mt-1">World explored</div>
            </div>
          </div>

          {/* Coming soon banner */}
          <div className="bg-indigo-600/20 border border-indigo-400/20 rounded-2xl px-4 py-3 mb-6 text-sm text-indigo-300">
            🗺️ Interactive Mapbox map coming tomorrow — Day 5
          </div>

          <button
            onClick={logout}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}