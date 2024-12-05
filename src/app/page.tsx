'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ActivationForm from '@/components/ActivationForm'
import TransferForm from '@/components/TransferForm'

export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const [showActivation, setShowActivation] = useState(true)

  if (isLoading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="text-center">
            <h2 className="text-xl font-semibold">加载中...</h2>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          {isAuthenticated && (
            <button
              onClick={logout}
              className="absolute top-0 right-0 text-sm text-gray-600 hover:text-gray-900"
            >
              退出登录
            </button>
          )}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">
              {isAuthenticated ? '积分转账' : 'AI 切磋大会'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAuthenticated
                ? '请选择摊位并输入转账金额'
                : '请输入手机号和密码'}
            </p>
          </div>

          {isAuthenticated ? (
            <TransferForm />
          ) : (
            <ActivationForm onSuccess={() => {
              setShowActivation(false)
              // 强制刷新页面以确保获取最新状态
              window.location.href = '/'
            }} />
          )}
        </div>
      </div>
    </main>
  )
}
