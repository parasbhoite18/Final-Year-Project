import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MenuManagerClient from './MenuManagerClient'
import RestaurantHeaderClient from './RestaurantHeaderClient'

export default async function RestaurantManagerPage({ params }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') redirect('/login')

  const restaurant = await prisma.vendorProfile.findFirst({
    where: { id, userId: session.user.id },
    include: {
      products: {
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      },
      orders: {
        include: { product: true, customer: true },
        orderBy: { placedAt: 'desc' },
        take: 10
      }
    }
  })

  if (!restaurant) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { storeType: restaurant.storeType },
    orderBy: { order: 'asc' }
  })

  // Debug: Log categories to ensure they're fetched correctly
  if (categories.length === 0) {
    console.warn(`No categories found for storeType: ${restaurant.storeType}`)
  }

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans selection:bg-swiggy-orange selection:text-white pb-24">
      
      {/* Interactive Header */}
      <RestaurantHeaderClient restaurant={restaurant} />

      <div className="max-w-[1200px] mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Menu Management Area */}
        <div className="lg:col-span-2">
          {/* We pass the initial products and categories to the client component that manages the modals */}
          <MenuManagerClient 
            restaurant={restaurant} 
            initialProducts={restaurant.products} 
            categories={categories} 
          />
        </div>

        {/* Sidebar: Recent Orders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-48">
            <h2 className="text-xl font-extrabold text-[#02060c] mb-6 tracking-tight">Recent Orders</h2>
            
            {restaurant.orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#02060c99] font-medium text-sm">No orders yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
                {restaurant.orders.map(order => (
                  <div key={order.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#3d4152] text-sm truncate pr-2">{order.product.name} (x{order.quantity})</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#02060c99] space-y-1">
                      <p><span className="font-semibold text-[#3d4152]">By:</span> {order.fullName}</p>
                      <p className="truncate"><span className="font-semibold text-[#3d4152]">To:</span> {order.addressLine}</p>
                      <p className="text-[10px] mt-2">{new Date(order.placedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
