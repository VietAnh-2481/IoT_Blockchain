import { useState } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi'
import { toast } from 'sonner'
import { Cpu, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import {
  IOT_REGISTRY,
  ARC_TESTNET_CHAIN_ID,
  EXPLORER_TX,
  strToBytes32,
  strToBytes,
} from '../contracts'

export default function RegisterDevice({ onSuccess }: { onSuccess?: () => void }) {
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [deviceName, setDeviceName] = useState('')
  const [pubKey, setPubKey] = useState('')
  const [metadataURI, setMetadataURI] = useState('')

  const { writeContract, data: hash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const wrongChain = chainId !== ARC_TESTNET_CHAIN_ID

  const handleRegister = () => {
    if (!deviceName.trim()) { toast.error('Nhập tên thiết bị'); return }
    if (wrongChain) { switchChain({ chainId: ARC_TESTNET_CHAIN_ID }); return }

    const deviceId = strToBytes32(deviceName.trim())
    const pubKeyBytes = pubKey.trim() ? strToBytes(pubKey.trim()) : strToBytes('pubkey:' + deviceName)
    const uri = metadataURI.trim() || `ipfs://iot/${deviceName.trim()}`

    writeContract({
      ...IOT_REGISTRY,
      functionName: 'registerDevice',
      args: [deviceId, pubKeyBytes, uri],
    })
  }

  const handleDone = () => {
    reset()
    setDeviceName('')
    setPubKey('')
    setMetadataURI('')
    onSuccess?.()
  }

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--accent)' }}>
        <Cpu size={18} />
        <span className="font-semibold text-sm">Đăng ký Thiết bị IoT</span>
      </div>

      {!address && (
        <p className="text-xs rounded-xl px-3 py-2" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
          Kết nối ví để đăng ký thiết bị.
        </p>
      )}

      {isSuccess ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
            <CheckCircle size={16} />
            <span className="font-semibold">Thiết bị đã đăng ký onchain!</span>
          </div>
          {hash && (
            <a
              href={`${EXPLORER_TX}${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-xs underline underline-offset-2"
              style={{ color: 'var(--accent)' }}
            >
              Xem transaction →
            </a>
          )}
          <button
            onClick={handleDone}
            className="text-xs px-4 py-2 rounded-xl border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Đăng ký thiết bị khác
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Tên thiết bị <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="vd: sensor-temp-001"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={!address || isPending || isConfirming}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-colors"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
              Sẽ được hash thành deviceId (bytes32) onchain.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Public Key (tuỳ chọn)
            </label>
            <input
              type="text"
              placeholder="vd: 04a1b2c3... (hex) hoặc để trống"
              value={pubKey}
              onChange={(e) => setPubKey(e.target.value)}
              disabled={!address || isPending || isConfirming}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none mono"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Metadata URI (tuỳ chọn)
            </label>
            <input
              type="text"
              placeholder="ipfs://... hoặc https://..."
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              disabled={!address || isPending || isConfirming}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            />
          </div>

          {wrongChain && address && (
            <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2" style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
              <AlertCircle size={13} />
              Sai mạng — nhấn đăng ký để chuyển sang Arc Testnet.
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={!address || isPending || isConfirming || !deviceName.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0d1b2f' }}
          >
            {(isPending || isConfirming) && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Xác nhận trong ví...' : isConfirming ? 'Đang xác nhận...' : wrongChain ? 'Chuyển mạng & Đăng ký' : 'Đăng ký thiết bị'}
          </button>
        </div>
      )}
    </div>
  )
}
