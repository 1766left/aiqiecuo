import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getParticipant } from '@/lib/notion'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
)

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    throw new Error('未登录')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.phone as string
  } catch {
    throw new Error('登录已过期')
  }
}

export async function GET(request: NextRequest) {
  try {
    const phone = await getUserFromToken(request)
    
    // 获取用户信息
    const participant = await getParticipant(phone)
    if (!participant) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      balance: participant.balance
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
    const message = error instanceof Error ? error.message : '获取余额失败'
    return NextResponse.json(
      { message },
      { status: error instanceof Error && error.message === '未登录' ? 401 : 500 }
    )
  }
}
