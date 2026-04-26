import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import fs from 'fs/promises'
import path from 'path'

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
    const shopName = formData.get('shopName')
    const storeType = formData.get('storeType') || 'RESTAURANT'
    const address = formData.get('address')
    const phone = formData.get('phone')
    const file = formData.get('image')

    if (!shopName) {
      return new Response('Shop name is required', { status: 400 })
    }

    let imageUrl = await saveImage(file)
    if (!imageUrl) {
      imageUrl = '/uploads/restaurant_banner.png'
    }

    const newProfile = await prisma.vendorProfile.create({
      data: {
        userId: session.user.id,
        shopName,
        storeType,
        address: address || null,
        phone: phone || null,
        image: imageUrl
      }
    })

    return new Response(JSON.stringify({ success: true, profile: newProfile }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error creating restaurant', { status: 500 })
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
    const shopName = formData.get('shopName')
    const storeType = formData.get('storeType')
    const address = formData.get('address')
    const phone = formData.get('phone')
    const file = formData.get('image')

    if (!id || !shopName) {
      return new Response('Invalid data', { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.vendorProfile.findFirst({
      where: { id: id, userId: session.user.id }
    })

    if (!existing) {
      return new Response('Restaurant not found or unauthorized', { status: 403 })
    }

    let imageUrl = await saveImage(file)
    if (!imageUrl) {
      imageUrl = existing.image // keep existing image
    }

    const updated = await prisma.vendorProfile.update({
      where: { id: id },
      data: {
        shopName,
        storeType: storeType || existing.storeType,
        address,
        phone,
        image: imageUrl
      }
    })

    return new Response(JSON.stringify({ success: true, profile: updated }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error updating restaurant', { status: 500 })
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

    if (!id) {
      return new Response('ID is required', { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.vendorProfile.findFirst({
      where: { id: id, userId: session.user.id }
    })

    if (!existing) {
      return new Response('Restaurant not found or unauthorized', { status: 403 })
    }

    await prisma.vendorProfile.delete({
      where: { id: id }
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response('Error deleting restaurant', { status: 500 })
  }
}
