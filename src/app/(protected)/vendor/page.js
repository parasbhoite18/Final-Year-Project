import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import VendorDashboardClient from './VendorDashboardClient'
import VendorProfileList from './VendorProfileList'
import './vendor.css'

export default async function VendorHubPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  if (session.user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-[#f0f0f5] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-black text-[#02060c] mb-2">Access Denied</h2>
          <p className="text-[#02060c99]">Only vendor partners can access this portal.</p>
        </div>
      </div>
    )
  }

  const vendorProfiles = await prisma.vendorProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { shopName: 'asc' },
    include: {
      _count: {
        select: { products: true, orders: true }
      },
      orders: {
        include: { product: true }
      }
    }
  })

  // Calculate high-level analytics
  const totalRevenue = vendorProfiles.reduce((sum, p) => 
    sum + p.orders.reduce((oSum, o) => oSum + (o.product.price * o.quantity), 0), 0
  )
  const totalOrders = vendorProfiles.reduce((sum, p) => sum + p._count.orders, 0)
  const totalProducts = vendorProfiles.reduce((sum, p) => sum + p._count.products, 0)

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans selection:bg-swiggy-orange selection:text-white pb-24">
      {/* Premium Hub Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#02060c] tracking-tight">Partner Hub</h1>
            <p className="text-[#02060c99] font-medium mt-1">Manage all your stores and restaurants in one place.</p>
          </div>
          {/* We pass the client component here to handle the Add Restaurant Modal */}
          <VendorDashboardClient defaultType={vendorProfiles.length > 0 ? vendorProfiles[0].storeType : 'RESTAURANT'} />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <VendorProfileList initialProfiles={vendorProfiles} />
      </div>
    </div>
  )
}
