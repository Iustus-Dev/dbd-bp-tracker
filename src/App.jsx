import React, { useState, useEffect } from 'react'
import './App.css'
import anniversaryHeader from './assets/dbd-10th-anniversary.jpg'

function App() {
  const [matches, setMatches] = useState([])
  const [character, setCharacter] = useState('')
  const [bloodpoints, setBloodpoints] = useState('')
  const [role, setRole] = useState('survivor')
  const [isEvent, setIsEvent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API base URL - adjusted for port 5000 as per server configuration
  const API_URL = 'http://localhost:5000/api/matches'

  // Fetch matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Failed to fetch matches')
        const data = await response.json()
        setMatches(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const handleAddMatch = async (e) => {
    e.preventDefault()
    
    const points = parseInt(bloodpoints, 10)
    if (!character || isNaN(points)) {
      alert('Please enter both character and valid bloodpoints.')
      return
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character,
          bloodpoints: points,
          role,
          isEvent,
        }),
      })

      if (!response.ok) throw new Error('Failed to add match')
      
      const newMatch = await response.json()
      setMatches((prev) => [newMatch, ...prev])
      
      // Reset inputs
      setCharacter('')
      setBloodpoints('')
      setIsEvent(false)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete match')
      
      // Use loose inequality (!=) to match backend logic and handle potential type mismatches
      setMatches((prev) => prev.filter((m) => m.id != id))
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-fog flex flex-col items-center p-4 md:p-8 text-dbd-text font-sans">
      {/* Anniversary Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-dbd-obsidian/80 border border-dbd-gold/50 px-4 py-2 rounded-none backdrop-blur-sm">
        <div className="w-2 h-2 bg-dbd-gold rounded-full animate-pulse"></div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-dbd-gold">10 Years in the Fog</span>
      </div>

      <div className="w-full max-w-5xl space-y-12 py-8">
        {/* Header Section */}
        <header className="text-center space-y-6 relative">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <img 
                src={anniversaryHeader} 
                alt="DBD 10th Anniversary" 
                className="w-48 h-48 md:w-64 md:h-64 object-cover border-2 border-dbd-gold/30 shadow-2xl shadow-dbd-gold/20 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 border border-dbd-gold/50 scale-110 pointer-events-none"></div>
            </div>
          </div>
          <div className="inline-block relative">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-dbd-gold uppercase italic select-none drop-shadow-2xl">
              Trial Logs
            </h1>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dbd-gold to-transparent"></div>
          </div>
          <p className="text-dbd-gold/60 font-bold tracking-[0.4em] uppercase text-xs md:text-sm pt-2">
            A Decade of Sacrifice • 2016 - 2026
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dbd-card p-6 rounded-none shadow-2xl overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-dbd-gold/50 uppercase text-[10px] font-black tracking-[0.2em] mb-1">
                Total Bloodpoints
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter group-hover:text-dbd-gold transition-colors">
                  {(Array.isArray(matches) ? matches : []).reduce((acc, m) => acc + m.bloodpoints, 0).toLocaleString()}
                </span>
                <span className="text-dbd-gold font-bold uppercase text-[10px]">BP</span>
              </div>
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] text-6xl font-black text-white/5 select-none pointer-events-none italic">BP</div>
          </div>

          <div className="dbd-card p-6 rounded-none shadow-2xl overflow-hidden group border-l-4 border-l-dbd-gold">
            <div className="relative z-10">
              <h2 className="text-dbd-gold uppercase text-[10px] font-black tracking-[0.2em] mb-1">
                Anniversary 10 Years
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-dbd-gold tabular-nums tracking-tighter">
                  {(Array.isArray(matches) ? matches : []).filter(m => m.isEvent).reduce((acc, m) => acc + m.bloodpoints, 0).toLocaleString()}
                </span>
                <span className="text-dbd-gold font-bold uppercase text-[10px]">BP</span>
              </div>
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] text-6xl font-black text-dbd-gold/5 select-none pointer-events-none italic">EV</div>
          </div>

          <div className="dbd-card p-6 rounded-none shadow-2xl overflow-hidden group border-l-4 border-l-dbd-red">
            <div className="relative z-10">
              <h2 className="text-dbd-red/50 uppercase text-[10px] font-black tracking-[0.2em] mb-1">
                Killer Harvest
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter group-hover:text-dbd-red transition-colors">
                  {(Array.isArray(matches) ? matches : []).filter(m => m.role === 'killer').reduce((acc, m) => acc + m.bloodpoints, 0).toLocaleString()}
                </span>
                <span className="text-dbd-red font-bold uppercase text-[10px]">BP</span>
              </div>
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] text-6xl font-black text-dbd-red/5 select-none pointer-events-none italic">KILL</div>
          </div>

          <div className="dbd-card p-6 rounded-none shadow-2xl overflow-hidden group border-l-4 border-l-blue-500">
            <div className="relative z-10">
              <h2 className="text-blue-500/50 uppercase text-[10px] font-black tracking-[0.2em] mb-1">
                Survivor Escape
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter group-hover:text-blue-500 transition-colors">
                  {(Array.isArray(matches) ? matches : []).filter(m => m.role === 'survivor').reduce((acc, m) => acc + m.bloodpoints, 0).toLocaleString()}
                </span>
                <span className="text-blue-500 font-bold uppercase text-[10px]">BP</span>
              </div>
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] text-6xl font-black text-blue-500/5 select-none pointer-events-none italic">SURV</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Input Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h3 className="text-dbd-gold uppercase text-sm font-black tracking-[0.2em]">
                Enter The Trial
              </h3>
              <p className="text-dbd-text/40 text-[10px] uppercase font-bold">Record your performance for the entity</p>
            </div>
            
            <form 
              onSubmit={handleAddMatch}
              className="bg-dbd-obsidian/40 backdrop-blur-md p-8 border border-white/5 space-y-8 relative"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('survivor')}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      role === 'survivor' 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    Survivor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('killer')}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      role === 'killer' 
                      ? 'bg-dbd-red border-dbd-red text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    Killer
                  </button>
                </div>

                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-black text-dbd-gold/50 tracking-[0.2em] group-focus-within:text-dbd-gold transition-colors">Character Selection</label>
                  <input
                    type="text"
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder={role === 'killer' ? "E.G. THE TRAPPER" : "E.G. DWIGHT FAIRFIELD"}
                    className="w-full bg-black/50 border-b-2 border-dbd-gray p-4 text-white focus:outline-none focus:border-dbd-gold transition-all placeholder:text-dbd-gray/50 uppercase font-bold tracking-wider text-sm"
                  />
                </div>
                
                <div className="space-y-2 group">
                  <label className="text-[10px] uppercase font-black text-dbd-gold/50 tracking-[0.2em] group-focus-within:text-dbd-gold transition-colors">Bloodpoints Earned</label>
                  <input
                    type="number"
                    value={bloodpoints}
                    onChange={(e) => setBloodpoints(e.target.value)}
                    placeholder="000,000"
                    className="w-full bg-black/50 border-b-2 border-dbd-gray p-4 text-white focus:outline-none focus:border-dbd-gold transition-all placeholder:text-dbd-gray/50 appearance-none font-bold tracking-wider text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEvent(!isEvent)}>
                  <div className={`w-5 h-5 border flex items-center justify-center transition-all ${
                    isEvent ? 'border-dbd-gold bg-dbd-gold/20' : 'border-white/20'
                  }`}>
                    {isEvent && <div className="w-2 h-2 bg-dbd-gold shadow-[0_0_8px_#FFD700]"></div>}
                  </div>
                  <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${
                    isEvent ? 'text-dbd-gold' : 'text-white/40 group-hover:text-white/60'
                  }`}>
                    10th Anniversary Event Trial
                  </span>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full group relative overflow-hidden bg-dbd-gold py-5 text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all active:scale-[0.98] shadow-2xl shadow-dbd-gold/10"
              >
                <span className="relative z-10">Submit to Entity</span>
                <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
              </button>
            </form>
          </div>

          {/* History Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="text-dbd-gold uppercase text-sm font-black tracking-[0.2em]">
                  Memory Shards
                </h3>
                <p className="text-dbd-text/40 text-[10px] uppercase font-bold">Your history in the fog</p>
              </div>
              <div className="text-[10px] uppercase font-bold text-dbd-gold/50 tracking-widest pb-1">
                {matches.length} Matches Found
              </div>
            </div>
            
            <div className="bg-dbd-obsidian/40 backdrop-blur-md border border-white/5 min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-dbd-gold/50 animate-pulse space-y-4">
                  <div className="w-8 h-8 border-2 border-dbd-gold border-t-transparent rounded-full animate-spin"></div>
                  <span className="uppercase text-[10px] font-black tracking-[0.3em]">Connecting to the fog...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-[400px] text-dbd-red font-black uppercase text-xs tracking-widest">
                  Transmission Interrupted: {error}
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-4 opacity-30 group">
                  <div className="w-16 h-16 border border-dbd-gold/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-dbd-gold">?</span>
                  </div>
                  <p className="uppercase text-[10px] font-black tracking-[0.2em]">The entity hungers for logs.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-[10px] uppercase font-black tracking-[0.2em] text-dbd-gold/50">
                        <th className="p-6">Character</th>
                        <th className="p-6">Role</th>
                        <th className="p-6 text-right">Bloodpoints</th>
                        <th className="p-6 text-right">Trial Date</th>
                        <th className="p-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {matches.map((match) => (
                        <tr key={match.id} className="group hover:bg-white/5 transition-all">
                          <td className="p-6 uppercase font-black text-white text-xs tracking-wider italic group-hover:text-dbd-gold transition-colors">
                            <div className="flex items-center gap-2">
                              {match.character}
                              {match.isEvent && (
                                <span className="text-[8px] bg-dbd-gold text-black px-1.5 py-0.5 rounded-none font-black italic">EVENT</span>
                              )}
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              match.role === 'killer' ? 'text-dbd-red' : 'text-blue-500'
                            }`}>
                              {match.role}
                            </span>
                          </td>
                          <td className="p-6 text-right tabular-nums font-bold text-dbd-gold">
                            {match.bloodpoints.toLocaleString()}
                          </td>
                          <td className="p-6 text-right text-[10px] text-dbd-text/40 font-bold uppercase tracking-tighter">
                            {new Date(match.timestamp).toLocaleDateString([], { 
                              month: 'short', 
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="p-6 text-right">
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              className="text-white/20 hover:text-dbd-red transition-colors text-[10px] uppercase font-black tracking-[0.2em]"
                            >
                              Discard
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
