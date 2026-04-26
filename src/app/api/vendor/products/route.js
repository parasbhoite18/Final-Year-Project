import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs/promises'
import path from 'path'

async function checkOwnership(vendorId, userId) {
  if (!vendorId || !userId) return false
  const profile = await prisma.vendorProfile.findFirst({
    where: { id: vendorId, userId }
  })
  return !!profile
}

async function saveImage(file) {
  if (!file || typeof file === 'string') return null;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const filepath = path.join(uploadDir, filename);
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if dir already exists
  }

  await fs.writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const formData = await req.formData()
    const vendorId = formData.get('vendorId')
    const categoryId = formData.get('categoryId')
    const name = formData.get('name')
    const description = formData.get('description')
    const price = formData.get('price')
    const dietaryType = formData.get('dietaryType') || 'VEG'
    const file = formData.get('image')
    
    if (!(await checkOwnership(vendorId, session.user.id))) {
      return new Response('Unauthorized - Vendor mismatch', { status: 403 })
    }

    let imageUrl = await saveImage(file)
    if (!imageUrl) {
      imageUrl = '/uploads/restaurant_banner.png' // Default generic image
    }

    const product = await prisma.product.create({
      data: {
        vendorId,
        categoryId: categoryId || null,
        name,
        description: description || null,
        price: parseFloat(price),
        image: imageUrl,
        dietaryType: dietaryType
      }
    })

    return new Response(JSON.stringify({ success: true, product }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error adding product', { status: 500 })
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const vendorId = searchParams.get('vendorId')

    if (!(await checkOwnership(vendorId, session.user.id))) {
      return new Response('Unauthorized - Vendor mismatch', { status: 403 })
    }

    await prisma.product.delete({
      where: {
        id,
        vendorId
      }
    })

    return new Response('Deleted', { status: 200 })
  } catch (error) {
    return new Response('Error deleting product', { status: 500 })
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'vendor') {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const formData = await req.formData()
    const id = formData.get('id')
    const vendorId = formData.get('vendorId')
    const categoryId = formData.get('categoryId')
    const name = formData.get('name')
    const description = formData.get('description')
    const price = formData.get('price')
    const dietaryType = formData.get('dietaryType')
    const file = formData.get('image')
    
    if (!(await checkOwnership(vendorId, session.user.id))) {
      return new Response('Unauthorized - Vendor mismatch', { status: 403 })
    }

    const existing = await prisma.product.findFirst({
      where: { id, vendorId }
    })

    if (!existing) return new Response('Product not found', { status: 404 })

    let imageUrl = await saveImage(file)
    if (!imageUrl) {
      imageUrl = existing.image // Keep existing if no new file uploaded
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        categoryId: categoryId || null,
        image: imageUrl,
        dietaryType: dietaryType || undefined
      }
    })

    return new Response(JSON.stringify({ success: true, product }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error updating product', { status: 500 })
  }
}
