'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorDashboardClient({ defaultType = 'RESTAURANT' }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    shopName: '',
    storeType: defaultType,
    address: '',
    phone: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = new FormData()
    payload.append('shopName', formData.shopName)
    payload.append('storeType', formData.storeType)
    payload.append('address', formData.address)
    payload.append('phone', formData.phone)
    if (imageFile) {
      payload.append('image', imageFile)
    }

    try {
      const res = await fetch('/api/vendor/restaurant', {
        method: 'POST',
        body: payload
      })

      if (res.ok) {
        setIsOpen(false)
        setFormData({ shopName: '', storeType: defaultType, address: '', phone: '' })
        setImageFile(null)
        router.refresh()
      } else {
        alert('Failed to add store')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: '#02060c', color: '#ffffff' }}
        className="px-6 py-3 rounded-full font-bold hover:bg-swiggy-orange transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        Add Store
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#02060c] opacity-70" onClick={() => setIsOpen(false)}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#02060c]">Add New Store</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={formData.shopName}
                  onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent" 
                  placeholder="Store Name"
                />
                <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                  Store Name
                </label>
              </div>

              {/* Store Type is now handled automatically based on your account selection during registration */}
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-2">
                <p className="text-[10px] font-black text-swiggy-orange uppercase tracking-[1px] mb-1">Creating Store As</p>
                <p className="text-sm font-bold text-[#282c3f]">{formData.storeType === 'RESTAURANT' ? '🍴 Restaurant Partner' : '🛍️ Instamart / Grocery Partner'}</p>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent" 
                  placeholder="Address"
                />
                <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                  Address (Optional)
                </label>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-swiggy-orange hover:file:bg-orange-100" 
                />
                <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f]">
                  Store Image (Optional)
                </label>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent" 
                  placeholder="Phone"
                />
                <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                  Phone (Optional)
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={{ backgroundColor: '#fc8019', color: '#ffffff' }}
                className="w-full font-extrabold text-lg py-4 rounded-xl mt-2 transition-colors shadow-md disabled:opacity-70 tracking-wide"
              >
                {loading ? 'CREATING...' : 'CREATE STORE'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
