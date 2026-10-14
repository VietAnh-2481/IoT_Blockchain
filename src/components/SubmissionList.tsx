import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Search, FileText, Clock, ExternalLink } from 'lucide-react'
import { DATA_VERIFIER, ARC_TESTNET_CHAIN_ID, strToBytes32 } from '../contracts'

interface Submission {
  deviceId: `0x${string}`
  dataHash: `0x${string}`
  dataURI: string
  submitter: `0x${string}`
  timestamp: bigint
}

function SubmissionRow({ id }: { id: bigint }) {
  const { data, isLoading } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'getSubmission',
    args: [id],
  })

  const sub = data as Submission | undefined

  const ts = sub?.timestamp
    ? new Date(Number(sub.timestamp) * 1000).toLocaleString('vi-VN')
    : ''

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse" style={{ background: 'var(--surface-muted)' }}>
        <div className="w-6 h-6 rounded-lg" style={{ background: 'var(--border)' }} />
        <div className="flex-1 h-3 rounded" style={{ background: 'var(--border)' }} />
      </div>
    )
  }

  if (!sub) return null

  return (
    <div
      className="rounded-xl border p-4 space-y-2"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="mono text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface)', color: 'var(--accent)' }}
        >
          #{String(id)}
        </span>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
          <Clock size={11} />
          {ts}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--subtle)', minWidth: 72 }}>Device:</span>
          <span className="mono truncate" style={{ color: 'var(--ink-2)' }}>
            {sub.deviceId.slice(0, 18)}...
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--subtle)', minWidth: 72 }}>Data hash:</span>
          <span className="mono truncate" style={{ color: 'var(--ink-2)' }}>
            {sub.dataHash.slice(0, 18)}...
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--subtle)', minWidth: 72 }}>URI:</span>
          <span className="truncate" style={{ color: 'var(--muted)', maxWidth: 220 }}>
            {sub.dataURI || '—'}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--subtle)', minWidth: 72 }}>Submitter:</span>
          <span className="mono truncate" style={{ color: 'var(--ink-2)' }}>
            {sub.submitter.slice(0, 10)}...{sub.submitter.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function SubmissionList() {
  const [deviceFilter, setDeviceFilter] = useState('')

  // Total submissions
  const { data: total } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'totalSubmissions',
    chainId: ARC_TESTNET_CHAIN_ID,
  })

  const totalN = typeof total === 'bigint' ? Number(total) : 0

  // Per-device filter
  const deviceId = deviceFilter.trim() ? strToBytes32(deviceFilter.trim()) : undefined
  const { data: deviceIds } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'getDeviceSubmissions',
    args: deviceId ? [deviceId] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!deviceId },
  })

  const filtered = deviceId
    ? (deviceIds as bigint[] | undefined) ?? []
    : Array.from({ length: totalN }, (_, i) => BigInt(totalN - 1 - i)).slice(0, 20)

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <FileText size={18} />
          <span className="font-semibold text-sm">Lịch sử Submissions</span>
        </div>
        <span className="mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
          {totalN} tổng
        </span>
      </div>

      {/* Filter by device */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
        <input
          type="text"
          placeholder="Lọc theo tên thiết bị..."
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none"
          style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        />
      </div>

      {totalN === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--subtle)' }}>
          Chưa có submission nào onchain.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'var(--subtle)' }}>
          Không tìm thấy submission cho thiết bị này.
        </p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((id) => (
            <SubmissionRow key={String(id)} id={id} />
          ))}
        </div>
      )}

      <a
        href="https://explorer.testnet.arc.io/address/0xb1eee7ff65adaae9874bcffbede2ab7035d595c2"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs"
        style={{ color: 'var(--subtle)' }}
      >
        <ExternalLink size={11} />
        Xem contract trên explorer
      </a>
    </div>
  )
}
