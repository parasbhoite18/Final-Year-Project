'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function VendorProfileList({ initialProfiles }) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loading, setLoading] = useState(null)

  const handleDelete = async (e, id, name) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all its products and menu items.`)) return

    setLoading(id)
    try {
      const res = await fetch(`/api/vendor/restaurant?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setProfiles(profiles.filter(p => p.id !== id))
        router.refresh()
      } else {
        alert('Failed to delete store')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while deleting')
    }
    setLoading(null)
  }

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-swiggy-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-[#02060c] mb-2">No Stores Found</h2>
        <p className="text-[#02060c99] max-w-md mx-auto mb-8 font-medium">You haven&apos;t added any restaurants or grocery stores yet. Add your first store to start selling.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map(profile => (
        <Link key={profile.id} href={`/vendor/restaurant/${profile.id}`} className="group block">
          <div className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 h-full flex flex-col ${loading === profile.id ? 'opacity-50 grayscale' : ''}`}>
            
            <div className="h-40 relative bg-gray-100 overflow-hidden">
              <Image 
                src={profile.image || (profile.storeType === 'RESTAURANT' ? '/uploads/restaurant_banner.png' : '/uploads/grocery_veg.png')} 
                alt={profile.shopName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm backdrop-blur-md ${profile.storeType === 'RESTAURANT' ? 'bg-orange-500/80' : 'bg-pink-500/80'}`}>
                  {profile.storeType}
                </span>
              </div>
              
              {/* Delete Button */}
              <button 
                onClick={(e) => handleDelete(e, profile.id, profile.shopName)}
                disabled={loading === profile.id}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-red-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20 shadow-sm"
                title="Delete Store"
              >
                {loading === profile.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                )}
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-extrabold text-[#02060c] mb-1 truncate">{profile.shopName}</h3>
              <p className="text-[#02060c99] text-sm mb-4 truncate">{profile.address || 'Address not provided'}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-[#02060c99] uppercase tracking-wider mb-1">Items</p>
                  <p className="text-lg font-black text-[#02060c]">{profile._count?.products || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#02060c99] uppercase tracking-wider mb-1">Orders</p>
                  <p className="text-lg font-black text-swiggy-orange">{profile._count?.orders || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
