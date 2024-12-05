import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: '登出成功' },
    { status: 200 }
  )

  // 在所有可能的路径下清除 cookie
  response.cookies.delete('token')
  
  // 显式设置过期的 cookie
  response.cookies.set({
    name: 'token',
    value: '',
    expires: new Date(0),
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  })

  return response
}
