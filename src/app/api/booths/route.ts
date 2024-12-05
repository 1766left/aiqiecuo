import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getAllBooths } from '@/lib/notion'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
)

async function verifyToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    throw new Error('未登录')
  }

  try {
    await jwtVerify(token, JWT_SECRET)
  } catch {
    throw new Error('登录已过期')
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyToken(request)
    
    // 获取所有摊位信息
    const booths = await getAllBooths()

    return NextResponse.json({
      success: true,
      booths
    })
  } catch (error) {
    console.error('Booths fetch error:', error)
    const message = error instanceof Error ? error.message : '获取摊位列表失败'
    return NextResponse.json(
      { message },
      { status: error instanceof Error && error.message === '未登录' ? 401 : 500 }
    )
  }
}
