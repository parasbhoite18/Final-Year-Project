'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MenuManagerClient({ restaurant, initialProducts, categories }) {
  const router = useRouter()
  
  // Ensure categories is an array with valid items
  const safeCategories = Array.isArray(categories) 
    ? categories.filter(cat => cat && typeof cat === 'object' && cat.id && cat.name) 
    : []
  
  // Debug log
  console.log('MenuManagerClient received:', { 
    restaurantId: restaurant?.id, 
    productsCount: initialProducts?.length, 
    categoriesCount: categories?.length,
    safeCategoriesCount: safeCategories.length,
    categories: categories
  })
  
  const [products, setProducts] = useState(initialProducts || [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    dietaryType: 'VEG'
  })

  const [imageFile, setImageFile] = useState(null)

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({ name: '', description: '', price: '', categoryId: '', dietaryType: 'VEG' })
    setImageFile(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      categoryId: product.categoryId || '',
      dietaryType: product.dietaryType || 'VEG'
    })
    setImageFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const url = '/api/vendor/products'
    const method = editingProduct ? 'PUT' : 'POST'
    
    const payload = new FormData()
    payload.append('vendorId', restaurant.id)
    if (editingProduct?.id) payload.append('id', editingProduct.id)
    payload.append('name', formData.name)
    payload.append('description', formData.description)
    payload.append('price', formData.price)
    payload.append('categoryId', formData.categoryId)
    payload.append('dietaryType', formData.dietaryType)
    
    if (imageFile) {
      payload.append('image', imageFile)
    }

    try {
      const res = await fetch(url, {
        method,
        // Do not set Content-Type header when sending FormData!
        // The browser will automatically set it to multipart/form-data with the correct boundary.
        body: payload
      })

      if (res.ok) {
        const { product } = await res.json()
        if (editingProduct) {
          setProducts(products.map(p => p.id === product.id ? product : p))
        } else {
          setProducts([product, ...products])
        }
        closeModal()
        router.refresh()
      } else {
        alert('Failed to save product')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await fetch(`/api/vendor/products?id=${id}&vendorId=${restaurant.id}`, { method: 'DELETE' })
      setProducts(products.filter(p => p.id !== id))
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-[#02060c] tracking-tight">Menu Items</h2>
        <button 
          onClick={openAddModal}
          style={{ backgroundColor: '#02060c', color: '#ffffff' }}
          className="px-5 py-2.5 rounded-full font-bold hover:bg-swiggy-orange transition-colors shadow-sm text-sm"
        >
          + Add New Item
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-[#02060c99] font-medium mb-4">You haven&apos;t added any items to this menu yet.</p>
          <button onClick={openAddModal} className="text-swiggy-orange font-bold hover:underline">Click here to add your first item</button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {Array.isArray(products) && products.length > 0 && products.map((product, index) => {
            if (!product || !product.id || !product.name) {
              console.warn('Invalid product object:', product)
              return null
            }
            return (
            <div key={product.id} className={`p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50 transition-colors ${index !== products.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex-1">
                <div className={`w-4 h-4 border ${product.dietaryType === 'NON-VEG' ? 'border-red-600' : product.dietaryType === 'EGG' ? 'border-yellow-500' : 'border-green-600'} flex items-center justify-center rounded-sm mb-1`}>
                  <div className={`w-2 h-2 ${product.dietaryType === 'NON-VEG' ? 'bg-red-600' : product.dietaryType === 'EGG' ? 'bg-yellow-500' : 'bg-green-600'} rounded-full`}></div>
                </div>
                <h3 className="text-lg font-bold text-[#3d4152] mb-1">{product.name}</h3>
                <p className="font-medium text-[#3d4152] mb-3">₹{product.price?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-[#02060c99] leading-relaxed line-clamp-2">{product.description || 'No description'}</p>
              </div>
              
              <div className="flex flex-col items-end gap-3 min-w-[120px]">
                <div className="w-[120px] h-[120px] relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">No Image</div>
                  )}
                </div>
                
                <div className="flex w-full gap-2">
                  <button onClick={() => openEditModal(product)} className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                    EDIT
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 border border-red-200 text-red-500 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                    DELETE
                  </button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Inline Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#02060c] opacity-70" onClick={closeModal}></div>
          
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-2xl font-black text-[#02060c]">{editingProduct ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent" 
                    placeholder="Item Name"
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                    Item Name
                  </label>
                </div>

                <div className="relative">
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent" 
                    placeholder="Price (₹)"
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                    Price (₹)
                  </label>
                </div>

                <div className="relative">
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all appearance-none bg-white" 
                  >
                    <option value="" disabled>Select a category</option>
                    {safeCategories && safeCategories.length > 0 ? (
                      safeCategories.map(cat => {
                        if (!cat || !cat.id || !cat.name) {
                          console.warn('Invalid category object:', cat)
                          return null
                        }
                        return <option key={cat.id} value={cat.id}>{cat.name}</option>
                      })
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                  <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f]">
                    Category
                  </label>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="relative">
                  <p className="text-xs font-semibold text-[#93959f] mb-2 px-1">Dietary Preference</p>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      className={`flex-1 py-3.5 font-bold text-xs rounded-xl transition-all border-2 flex flex-col items-center justify-center gap-1.5 ${formData.dietaryType === 'VEG' ? 'border-green-600 bg-green-50 text-green-700 scale-[1.02] shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setFormData({ ...formData, dietaryType: 'VEG' })}
                    >
                      <div className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-sm">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      VEG
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-3.5 font-bold text-xs rounded-xl transition-all border-2 flex flex-col items-center justify-center gap-1.5 ${formData.dietaryType === 'NON-VEG' ? 'border-red-600 bg-red-50 text-red-700 scale-[1.02] shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setFormData({ ...formData, dietaryType: 'NON-VEG' })}
                    >
                      <div className="w-4 h-4 border border-red-600 flex items-center justify-center rounded-sm">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      NON-VEG
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-3.5 font-bold text-xs rounded-xl transition-all border-2 flex flex-col items-center justify-center gap-1.5 ${formData.dietaryType === 'EGG' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 scale-[1.02] shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => setFormData({ ...formData, dietaryType: 'EGG' })}
                    >
                      <div className="w-4 h-4 border border-yellow-500 flex items-center justify-center rounded-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      EGG
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-swiggy-orange hover:file:bg-orange-100" 
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f]">
                    Item Image (Optional)
                  </label>
                </div>

                <div className="relative">
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="peer w-full px-4 pt-6 pb-2 border border-[#bebfc5] rounded-xl text-[#02060c] font-medium focus:outline-none focus:border-swiggy-orange focus:ring-1 focus:ring-swiggy-orange transition-all placeholder-transparent resize-none" 
                    placeholder="Description (Optional)"
                    rows="3"
                  />
                  <label className="absolute left-4 top-2 text-xs font-semibold text-[#93959f] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-swiggy-orange pointer-events-none">
                    Description (Optional)
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                type="submit" 
                form="productForm"
                disabled={loading} 
                style={{ backgroundColor: '#fc8019', color: '#ffffff' }}
                className="w-full font-extrabold text-lg py-4 rounded-xl transition-colors shadow-md disabled:opacity-70 tracking-wide"
              >
                {loading ? 'SAVING...' : editingProduct ? 'SAVE CHANGES' : 'ADD ITEM'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
