'use client'

import { useEffect, useState } from 'react'
import ActivationForm from '@/components/ActivationForm'
import TransferForm from '@/components/TransferForm'

export default function Home() {
  const [isActivated, setIsActivated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Check token and activation status
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-8">AI 切磋大会积分系统</h1>
      {!isActivated ? (
        <ActivationForm onActivationSuccess={() => setIsActivated(true)} />
      ) : (
        <TransferForm />
      )}
    </div>
  )
}
