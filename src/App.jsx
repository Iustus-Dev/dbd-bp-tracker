import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [matches, setMatches] = useState([])
  const [character, setCharacter] = useState('')
  const [bloodpoints, setBloodpoints] = useState('')
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
        }),
      })

      if (!response.ok) throw new Error('Failed to add match')
      
      const newMatch = await response.json()
      setMatches((prev) => [newMatch, ...prev])
      
      // Reset inputs
      setCharacter('')
      setBloodpoints('')
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
    <div className="min-h-screen bg-dbd-dark flex flex-col items-center p-8 text-dbd-text">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tighter text-dbd-red uppercase italic">
            Match History Tracker
          </h1>
          <p className="text-dbd-gray font-medium tracking-widest uppercase text-sm">
            Death is not an escape
          </p>
        </div>

        {/* Total Stats (Optional but nice) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dbd-dark border-2 border-dbd-gray p-6 rounded-sm shadow-2xl relative overflow-hidden group hover:border-dbd-red transition-colors duration-500">
            <div className="absolute top-0 left-0 w-1 h-full bg-dbd-red"></div>
            <h2 className="text-dbd-gray uppercase text-xs font-bold tracking-widest mb-1">
              Total Bloodpoints Recorded
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-dbd-text tabular-nums tracking-tighter">
                {matches.reduce((acc, m) => acc + m.bloodpoints, 0).toLocaleString()}
              </span>
              <span className="text-dbd-red font-bold uppercase text-sm">BP</span>
            </div>
          </div>
          <div className="bg-dbd-dark border-2 border-dbd-gray p-6 rounded-sm shadow-2xl relative overflow-hidden group hover:border-dbd-red transition-colors duration-500">
            <div className="absolute top-0 left-0 w-1 h-full bg-dbd-red"></div>
            <h2 className="text-dbd-gray uppercase text-xs font-bold tracking-widest mb-1">
              Total Matches Tracked
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-dbd-text tabular-nums tracking-tighter">
                {matches.length}
              </span>
              <span className="text-dbd-red font-bold uppercase text-sm">Rounds</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form 
          onSubmit={handleAddMatch}
          className="bg-dbd-gray/10 p-8 border border-dbd-gray/30 rounded-sm space-y-6"
        >
          <h3 className="text-dbd-text uppercase text-sm font-bold tracking-widest border-b border-dbd-red pb-2 w-fit">
            Record New Match
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-dbd-gray tracking-widest">Character</label>
              <input
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                placeholder="The Trapper, Meg Thomas, etc."
                className="w-full bg-dbd-dark border border-dbd-gray p-3 text-dbd-text focus:outline-none focus:border-dbd-red transition-colors placeholder:text-dbd-gray/50 uppercase font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-dbd-gray tracking-widest">Bloodpoints</label>
              <input
                type="number"
                value={bloodpoints}
                onChange={(e) => setBloodpoints(e.target.value)}
                placeholder="Amount Earned..."
                className="w-full bg-dbd-dark border border-dbd-gray p-3 text-dbd-text focus:outline-none focus:border-dbd-red transition-colors placeholder:text-dbd-gray/50 appearance-none font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-dbd-red py-4 text-dbd-text font-bold uppercase tracking-widest hover:bg-red-800 transition-colors active:scale-95 shadow-lg shadow-dbd-red/20"
          >
            Add to History
          </button>
        </form>

        {/* Match History Table */}
        <div className="space-y-4">
          <h3 className="text-dbd-text uppercase text-sm font-bold tracking-widest">
            Match History
          </h3>
          
          {loading ? (
            <div className="text-center py-12 text-dbd-gray animate-pulse uppercase tracking-widest">
              Connecting to the fog...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-dbd-red font-bold uppercase tracking-widest">
              Error: {error}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-dbd-gray/30 text-dbd-gray uppercase tracking-widest text-sm">
              No matches recorded yet. Start your trial.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-dbd-gray text-left text-xs uppercase font-bold tracking-widest text-dbd-gray">
                    <th className="pb-4 pr-4">Character</th>
                    <th className="pb-4 px-4 text-right">Bloodpoints</th>
                    <th className="pb-4 px-4 text-right">Date / Time</th>
                    <th className="pb-4 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dbd-gray/30">
                  {matches.map((match) => (
                    <tr key={match.id} className="group hover:bg-dbd-red/5 transition-colors">
                      <td className="py-4 pr-4 uppercase font-bold text-dbd-text tracking-tight italic">
                        {match.character}
                      </td>
                      <td className="py-4 px-4 text-right tabular-nums font-medium text-dbd-red">
                        {match.bloodpoints.toLocaleString()} <span className="text-[10px] opacity-50">BP</span>
                      </td>
                      <td className="py-4 px-4 text-right text-xs text-dbd-gray font-medium">
                        {new Date(match.timestamp).toLocaleString([], { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <button
                          onClick={() => handleDeleteMatch(match.id)}
                          className="text-dbd-gray hover:text-dbd-red transition-colors text-xs uppercase font-bold tracking-tighter"
                        >
                          Delete
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
  )
}

export default App
