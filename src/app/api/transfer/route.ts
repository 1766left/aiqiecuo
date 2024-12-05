import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import {
  getParticipant,
  updateParticipant,
  updateBoothBalance,
  createTransaction,
  getAllBooths
} from '@/lib/notion'

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

export async function POST(request: NextRequest) {
  try {
    const phone = await getUserFromToken(request)
    const { boothId, amount, note } = await request.json()

    // 获取用户信息
    const participant = await getParticipant(phone)
    if (!participant) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查余额
    if (participant.balance < amount) {
      return NextResponse.json(
        { message: '余额不足，请检查账户余额' },
        { status: 400 }
      )
    }

    // 获取摊位信息
    const booths = await getAllBooths()
    const booth = booths.find(b => b.id === boothId)
    if (!booth) {
      return NextResponse.json(
        { message: '摊位不存在' },
        { status: 404 }
      )
    }

    // 更新参会者余额
    const newParticipantBalance = participant.balance - amount
    await updateParticipant(phone, {
      balance: newParticipantBalance
    })

    // 更新摊主余额
    const newBoothBalance = booth.balance + amount
    await updateBoothBalance(boothId, amount)

    // 记录交易
    await createTransaction({
      participantPhone: phone,
      boothId,
      boothName: booth.name,
      amount,
      note,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: '转账成功',
      newBalance: newParticipantBalance,
      boothBalance: newBoothBalance,
      boothName: booth.name
    })
  } catch (error) {
    console.error('Transfer error:', error)
    const message = error instanceof Error ? error.message : '转账失败，请稍后重试'
    return NextResponse.json(
      { message },
      { status: error instanceof Error && error.message === '未登录' ? 401 : 500 }
    )
  }
}
