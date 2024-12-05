import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SignJWT } from 'jose'
import { getParticipant, updateParticipant } from '@/lib/notion'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
)

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    const participant = await getParticipant(phone)
    if (!participant) {
      return NextResponse.json(
        { message: '用户不存在' },
        { status: 404 }
      )
    }

    if (participant.isActivated) {
      // 如果已激活，验证密码
      if (participant.password !== password) {
        return NextResponse.json(
          { message: '密码错误' },
          { status: 401 }
        )
      }
    } else {
      // 如果未激活，设置密码并激活
      await updateParticipant(phone, {
        password,
        isActivated: true
      })
    }

    // 生成 JWT token
    const token = await new SignJWT({ phone })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d') // 设置为7天过期
      .sign(JWT_SECRET)

    const response = NextResponse.json(
      { message: '登录成功', balance: participant.balance },
      { status: 200 }
    )

    // 设置 cookie，增加更多选项
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天过期
      path: '/'
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
