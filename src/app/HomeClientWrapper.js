'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import AuthDrawer from '@/components/AuthDrawer'
import LocationPicker from '@/components/LocationPicker'

export default function HomeClientWrapper({ session: initialSession, children }) {
  const { data: session } = useSession()
  const displaySession = session || initialSession
  
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authView, setAuthView] = useState('login')

  const openAuth = (view) => {
    setAuthView(view)
    setIsAuthOpen(true)
  }

  const handleCartClick = (e) => {
    if (!displaySession) {
      e.preventDefault()
      openAuth('login')
    }
  }

  return (
    <>
      {/* Global Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm px-4 md:px-0 h-[70px] md:h-[80px]">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="text-2xl md:text-3xl font-extrabold text-swiggy-orange tracking-tight">
              LocalSwig
            </Link>
            <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1 md:mx-2"></div>
            <div className="flex items-center">
              <LocationPicker />
            </div>
          </div>
          
          <div className="flex items-center gap-6 md:gap-8 font-bold text-[#3d4152]">
            <Link href="/search" className="flex items-center gap-2 cursor-pointer hover:text-swiggy-orange transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="hidden lg:inline text-sm uppercase tracking-wider">Search</span>
            </Link>
            
            {displaySession ? (
              <div className="flex items-center gap-4 md:gap-8">
                <Link href="/cart" onClick={handleCartClick} className="flex items-center gap-2 hover:text-swiggy-orange transition-colors">
                  <div className="relative">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <span className="hidden lg:inline text-sm uppercase tracking-wider">Cart</span>
                </Link>

                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = displaySession.user.role === 'vendor' ? '/vendor' : '/orders'}>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-swiggy-orange border border-gray-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                  </div>
                  <span className="hidden md:inline text-sm uppercase tracking-wider group-hover:text-swiggy-orange transition-colors">{displaySession.user.name?.split(' ')[0]}</span>
                </div>

                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className="text-xs font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6 md:gap-8">
                <button onClick={() => openAuth('login')} className="hover:text-swiggy-orange transition-colors font-black text-xs md:text-sm uppercase tracking-wider">Sign In</button>
                <button onClick={() => openAuth('register')} className="hover:text-swiggy-orange transition-colors font-black text-xs md:text-sm uppercase tracking-wider">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {children}

      {/* Auth Drawer */}
      <AuthDrawer 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialView={authView} 
      />
    </>
  )
}
