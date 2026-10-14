import { useState } from 'react'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useSwitchChain,
} from 'wagmi'
import { toast } from 'sonner'
import { Database, CheckCircle, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import {
  DATA_VERIFIER,
  USDC_ADDRESS,
  USDC_ABI,
  ARC_TESTNET_CHAIN_ID,
  EXPLORER_TX,
  strToBytes32,
  strToBytes,
} from '../contracts'

const SUBMISSION_FEE = 10_000n // 0.01 USDC

export default function SubmitData({ onSuccess }: { onSuccess?: () => void }) {
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [deviceName, setDeviceName] = useState('')
  const [payload, setPayload] = useState('')
  const [dataURI, setDataURI] = useState('')
  const [step, setStep] = useState<'idle' | 'approving' | 'approved' | 'submitting' | 'done'>('idle')

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, DATA_VERIFIER.address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address },
  })

  const hasAllowance = typeof allowance === 'bigint' && allowance >= SUBMISSION_FEE

  // Approve tx
  const {
    writeContract: approve,
    data: approveHash,
    isPending: approvePending,
    reset: resetApprove,
  } = useWriteContract()
  const { isLoading: approveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash })

  // Submit tx
  const {
    writeContract: submit,
    data: submitHash,
    isPending: submitPending,
    reset: resetSubmit,
  } = useWriteContract()
  const { isLoading: submitConfirming, isSuccess: submitSuccess } =
    useWaitForTransactionReceipt({ hash: submitHash })

  const wrongChain = chainId !== ARC_TESTNET_CHAIN_ID

  const handleApprove = () => {
    if (wrongChain) { switchChain({ chainId: ARC_TESTNET_CHAIN_ID }); return }
    setStep('approving')
    approve({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [DATA_VERIFIER.address, SUBMISSION_FEE],
    })
  }

  if (approveSuccess && step === 'approving') {
    void refetchAllowance()
    setStep('approved')
  }

  const handleSubmit = () => {
    if (!deviceName.trim() || !payload.trim()) {
      toast.error('Điền đầy đủ Device ID và Payload')
      return
    }
    if (wrongChain) { switchChain({ chainId: ARC_TESTNET_CHAIN_ID }); return }
    setStep('submitting')
    const deviceId = strToBytes32(deviceName.trim())
    const dataHash = strToBytes32(payload.trim())
    const uri = dataURI.trim() || `data:text/plain;${payload.trim()}`
    submit({
      ...DATA_VERIFIER,
      functionName: 'submitData',
      args: [deviceId, dataHash, uri],
    })
  }

  if (submitSuccess && step === 'submitting') {
    setStep('done')
  }

  const handleReset = () => {
    resetApprove(); resetSubmit()
    setStep('idle'); setDeviceName(''); setPayload(''); setDataURI('')
    onSuccess?.()
  }

  const isWorking = approvePending || approveConfirming || submitPending || submitConfirming
  const needsApprove = !hasAllowance && step !== 'approved'

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--accent)' }}>
        <Database size={18} />
        <span className="font-semibold text-sm">Nộp Dữ liệu IoT</span>
        <span className="ml-auto mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
          0.01 USDC/lần
        </span>
      </div>

      {!address && (
        <p className="text-xs rounded-xl px-3 py-2" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
          Kết nối ví để nộp dữ liệu.
        </p>
      )}

      {step === 'done' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
            <CheckCircle size={16} />
            <span className="font-semibold">Dữ liệu đã lưu onchain!</span>
          </div>
          {submitHash && (
            <a
              href={`${EXPLORER_TX}${submitHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-xs underline underline-offset-2"
              style={{ color: 'var(--accent)' }}
            >
              Xem transaction →
            </a>
          )}
          <button
            onClick={handleReset}
            className="text-xs px-4 py-2 rounded-xl border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Nộp dữ liệu khác
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Tên thiết bị (Device ID) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="vd: sensor-temp-001 (phải đã đăng ký)"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={!address || isWorking}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Payload dữ liệu <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder='vd: {"temp":25.3,"hum":68,"ts":1728857000}'
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              disabled={!address || isWorking}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none mono"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
              Sẽ được hash (bytes32) và lưu bất biến onchain.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--subtle)' }}>
              Data URI (tuỳ chọn)
            </label>
            <input
              type="text"
              placeholder="ipfs://... hoặc https://..."
              value={dataURI}
              onChange={(e) => setDataURI(e.target.value)}
              disabled={!address || isWorking}
              className="w-full rounded-xl px-3 py-2.5 text-sm border outline-none"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          {/* Step indicator */}
          {address && (
            <div className="flex items-center gap-3 text-xs">
              <div className={`flex items-center gap-1.5 ${!needsApprove ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {!needsApprove ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
                {!needsApprove ? 'USDC đã approve' : 'Cần approve 0.01 USDC'}
              </div>
            </div>
          )}

          {wrongChain && address && (
            <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2" style={{ background: 'var(--surface-muted)', color: 'var(--danger)' }}>
              <AlertCircle size={13} /> Sai mạng — nhấn nút bên dưới để chuyển sang Arc Testnet.
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {needsApprove && (
              <button
                onClick={handleApprove}
                disabled={!address || isWorking}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 border"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent' }}
              >
                {(approvePending || approveConfirming) && <Loader2 size={15} className="animate-spin" />}
                {approvePending ? 'Xác nhận approve trong ví...' : approveConfirming ? 'Đang xác nhận approve...' : 'Bước 1: Approve 0.01 USDC'}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!address || isWorking || needsApprove || !deviceName.trim() || !payload.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#0d1b2f' }}
            >
              {(submitPending || submitConfirming) && <Loader2 size={15} className="animate-spin" />}
              {submitPending ? 'Xác nhận trong ví...' : submitConfirming ? 'Đang xác nhận...' : needsApprove ? 'Bước 2: Nộp dữ liệu' : 'Nộp dữ liệu (0.01 USDC)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
