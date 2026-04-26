'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, Store } from 'lucide-react'
import LocationPicker from './LocationPicker'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 md:px-0">
      <div className="max-w-[1200px] mx-auto h-[70px] md:h-[80px] flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="text-2xl md:text-3xl font-extrabold text-swiggy-orange tracking-tight">
            LocalSwig
          </Link>
          <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1 md:mx-2"></div>
          <div className="flex items-center">
            <LocationPicker />
          </div>
        </div>

        <nav className="flex items-center gap-6 md:gap-8 font-bold text-[#3d4152]">
          <Link href="/search" className="flex items-center gap-2 cursor-pointer hover:text-swiggy-orange transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="hidden lg:inline text-sm uppercase tracking-wider">Search</span>
          </Link>

          {status === 'authenticated' ? (
            <div className="flex items-center gap-4 md:gap-8">
              <Link href="/cart" className="flex items-center gap-2 hover:text-swiggy-orange transition-colors">
                <ShoppingCart size={20} />
                <span className="hidden lg:inline text-sm uppercase tracking-wider">Cart</span>
              </Link>
              
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.href = session.user.role === 'vendor' ? '/vendor' : '/orders'}>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-swiggy-orange border border-gray-200">
                  <User size={16} />
                </div>
                <span className="hidden md:inline text-sm uppercase tracking-wider group-hover:text-swiggy-orange transition-colors">{session.user.name?.split(' ')[0]}</span>
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
              <Link href="/login" className="text-[#3d4152] font-black text-xs md:text-sm hover:text-swiggy-orange transition-colors uppercase tracking-wider">Sign In</Link>
              <Link href="/register" className="text-[#3d4152] font-black text-xs md:text-sm hover:text-swiggy-orange transition-colors uppercase tracking-wider">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
