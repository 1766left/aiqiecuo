import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key'
)

export async function middleware(request: NextRequest) {
  // 不拦截登录相关的 API
  if (request.nextUrl.pathname === '/api/activate') {
    return NextResponse.next()
  }

  // 对其他 API 路由进行认证
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { message: '未登录' },
        { status: 401 }
      )
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { message: '登录已过期' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
