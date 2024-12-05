import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getParticipant, updateParticipant } from '@/lib/notion'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
)

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    // 查询参会者信息
    const participant = await getParticipant(phone)

    if (!participant) {
      return NextResponse.json(
        { message: '手机号不存在，请联系管理员' },
        { status: 404 }
      )
    }

    if (participant.isActivated) {
      if (participant.password === password) {
        return NextResponse.json(
          { message: '无需重复激活，可以使用了' },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          { message: '密码错误，请联系管理员' },
          { status: 401 }
        )
      }
    }

    // 激活账号
    await updateParticipant(phone, {
      password,
      isActivated: true
    })

    // 生成 JWT token
    const token = await new SignJWT({ phone })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      message: `请记住你的密码是 ${password}；你的积分余额为 ${participant.balance}。如果健忘建议截图保存密码`,
      balance: participant.balance
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { message: '激活失败，请稍后重试' },
      { status: 500 }
    )
  }
}
