'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Search, X } from 'lucide-react'

export default function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [location, setLocation] = useState('Setup your location')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    // Safely load from localStorage after hydration
    const saved = localStorage.getItem('user-location')
    if (saved) setLocation(saved)
  }, [])

  useEffect(() => {
    if (search.trim().length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5&countrycodes=in`)
          const data = await res.json()
          setSuggestions(data || [])
        } catch (error) {
          console.error('Search failed:', error)
        }
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [search])

  const updateLocation = (newLoc) => {
    setLocation(newLoc)
    localStorage.setItem('user-location', newLoc)
    setIsOpen(false)
  }

  const getMyLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            // Using OpenStreetMap's Nominatim API for free reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en'
                }
              }
            )
            const data = await response.json()
            
            if (data && data.display_name) {
              // Clean up the display name a bit (remove zip codes or country if too long)
              const parts = data.display_name.split(', ')
              const simplified = parts.slice(0, 4).join(', ')
              updateLocation(simplified)
            } else {
              updateLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error)
            updateLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          } finally {
            setLoading(false)
          }
        },
        (error) => {
          console.error(error)
          setLoading(false)
          let msg = 'Location access denied.'
          if (error.code === 1) msg = 'Location access denied by user.'
          else if (error.code === 2) msg = 'Location unavailable.'
          else if (error.code === 3) msg = 'Location request timed out.'
          alert(`${msg} Please select manually.`)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setLoading(false)
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      updateLocation(search)
      setSearch('')
    }
  }

  return (
    <div className="relative">
      {/* Navbar Trigger */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-[#686b78] cursor-pointer group hover:text-swiggy-orange transition-all"
      >
        <div className="bg-orange-50 p-2 rounded-lg group-hover:bg-orange-100 transition-colors">
          <MapPin size={18} className="text-swiggy-orange" />
        </div>
        <div className="flex flex-col -gap-0.5">
          <span className="font-black text-[#282c3f] text-[15px] border-b-2 border-transparent group-hover:border-swiggy-orange transition-all">
            {location ? location.split(',')[0] : 'Set Location'}
          </span>
          <span className="truncate max-w-[150px] text-[11px] font-bold opacity-60 uppercase tracking-tighter">
            {location && location.split(',').length > 1 ? location.split(',').slice(1).join(',') : 'Tap to set location'}
          </span>
        </div>
        <svg className="w-3.5 h-3.5 text-swiggy-orange group-hover:translate-y-0.5 transition-transform ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Location Drawer/Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-full max-w-[480px] bg-white z-[101] shadow-2xl animate-slide-right overflow-y-auto">
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-center mb-8 md:mb-10">
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#3d4152] transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="relative mb-8 md:mb-10">
                <form onSubmit={handleSearch}>
                  <input 
                    type="text" 
                    placeholder="Search for area, street name.." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-14 md:h-16 pl-14 pr-6 border border-[#d4d5d9] focus:border-swiggy-orange focus:shadow-[0_8px_30px_rgba(252,128,25,0.1)] outline-none font-bold text-base md:text-lg transition-all rounded-lg"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#686b78]" size={24} />
                </form>

                {/* Live Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white shadow-2xl z-[102] border border-[#d4d5d9] rounded-b-lg mt-1 max-h-[400px] overflow-y-auto animate-fade-in">
                    {suggestions.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => updateLocation(item.display_name)}
                        className="p-5 hover:bg-orange-50 cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-0 group transition-all"
                      >
                        <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-swiggy-orange/10 transition-colors shrink-0">
                          <MapPin size={20} className="text-[#93959f] group-hover:text-swiggy-orange" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-[#3d4152] group-hover:text-black leading-tight">
                            {item.display_name.split(',')[0]}
                          </span>
                          <span className="text-[11px] font-bold text-[#93959f] line-clamp-1 mt-0.5">
                            {item.display_name.split(',').slice(1).join(',')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {search.length > 0 && suggestions.length === 0 && !loading && (
                   <div className="absolute top-full left-0 right-0 bg-white shadow-2xl z-[102] border border-[#d4d5d9] rounded-b-lg mt-1 p-6 text-center">
                     <p className="text-sm font-bold text-gray-400">Searching across India...</p>
                   </div>
                )}
              </div>

              {/* Current Location Button */}
              <div 
                onClick={getMyLocation}
                className="flex items-center gap-5 p-6 border border-[#d4d5d9] hover:border-swiggy-orange hover:bg-orange-50/30 cursor-pointer group transition-all mb-10 rounded-xl"
              >
                <div className="text-[#3d4152] group-hover:text-swiggy-orange transition-colors">
                  <Navigation size={28} className={loading ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h4 className="font-black text-[17px] text-[#3d4152] group-hover:text-swiggy-orange transition-colors">
                    {loading ? 'Finding you in Pune...' : 'Get Current Location'}
                  </h4>
                  <p className="text-xs font-bold text-[#93959f] uppercase tracking-wider">Using GPS</p>
                </div>
              </div>

              {/* Recent Searches / Saved Locations */}
              <div>
                <h3 className="text-[12px] font-black text-[#93959f] uppercase tracking-[2px] mb-6">Saved Addresses</h3>
                <div className="space-y-8">
                  {[
                    { name: 'Home (New Sangavi)', addr: 'New Sangavi, Pune, Maharashtra' },
                    { name: 'Work (Pune)', addr: 'Hinjewadi IT Park, Pune, Maharashtra' },
                    { name: 'Kothrud', addr: 'Kothrud, Pune, Maharashtra' },
                    { name: 'Viman Nagar', addr: 'Viman Nagar, Pune, Maharashtra' }
                  ].map((loc, i) => (
                    <div 
                      key={i} 
                      onClick={() => updateLocation(loc.addr)}
                      className="flex gap-5 cursor-pointer group"
                    >
                      <MapPin className="text-[#686b78] group-hover:text-swiggy-orange shrink-0 mt-1" size={22} />
                      <div className="border-b border-dashed border-[#d4d5d9] pb-6 w-full group-hover:border-swiggy-orange transition-colors">
                        <h4 className="font-black text-[16px] text-[#3d4152] group-hover:text-swiggy-orange transition-colors">{loc.name}</h4>
                        <p className="text-sm font-medium text-[#93959f] leading-relaxed">{loc.addr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  )
}
