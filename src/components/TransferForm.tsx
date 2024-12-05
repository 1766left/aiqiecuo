'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Booth {
  id: string
  name: string
}

export default function TransferForm() {
  const searchParams = useSearchParams()
  const preSelectedId = searchParams.get('id')

  const [balance, setBalance] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [booths, setBooths] = useState<Booth[]>([])
  const [selectedBooth, setSelectedBooth] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceRes = await fetch('/api/balance')
        if (!balanceRes.ok) {
          throw new Error('获取余额失败')
        }
        const balanceData = await balanceRes.json()
        setBalance(balanceData.balance)
      } catch (err) {
        setError('获取余额失败')
      }
    }

    const fetchBooths = async () => {
      try {
        const response = await fetch('/api/booths')
        if (!response.ok) {
          throw new Error('获取摊位列表失败')
        }
        const data = await response.json()
        // 确保 data.booths 是数组
        const boothsList = Array.isArray(data.booths) ? data.booths : []
        setBooths(boothsList)
        
        // 如果有预选的摊位 ID，自动选中
        if (preSelectedId) {
          const booth = boothsList.find((b: Booth) => b.id === preSelectedId)
          if (booth) {
            setSelectedBooth(booth.id)
          }
        }
      } catch (error) {
        setError('获取摊位列表失败，请刷新重试')
      }
    }

    const fetchInitialData = async () => {
      await Promise.all([fetchBalance(), fetchBooths()])
    }

    fetchInitialData()
  }, [preSelectedId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boothId: selectedBooth,
          amount: parseInt(amount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '转账失败')
      }

      setSuccess(`✨ 转账成功！您的余额为 ${data.newBalance} 积分`)
      setAmount('')
      setSelectedBooth('')
      
      // 成功后刷新余额
      await fetchBalance()
    } catch (err) {
      setError(err instanceof Error ? err.message : '转账失败，请重试')
      // 失败后也刷新余额，确保显示正确的余额
      await fetchBalance()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          当前积分余额: <span className="font-bold">{balance ?? '加载中...'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="booth" className="block text-sm font-medium text-gray-700">
            选择摊位
          </label>
          <select
            id="booth"
            value={selectedBooth}
            onChange={(e) => setSelectedBooth(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">请选择摊位</option>
            {booths.map((booth) => (
              <option key={booth.id} value={booth.id}>
                {booth.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            转账金额
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="1"
            max={balance ?? undefined}
            placeholder="请输入转账金额"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '处理中...' : '确认转账'}
        </button>
      </form>
    </div>
  )
}
