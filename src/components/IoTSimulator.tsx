import { useState, useRef, useCallback } from 'react'
import { Radio, Play, Square, RefreshCw } from 'lucide-react'

interface SimLog {
  id: number
  ts: string
  device: string
  payload: string
  hash: string
  status: 'sent' | 'hashing' | 'ready'
}

const DEVICES = ['sensor-temp-001', 'sensor-hum-002', 'energy-meter-003', 'pressure-004', 'flow-005']

function randomPayload(device: string): string {
  const base: Record<string, () => object> = {
    'sensor-temp-001': () => ({ temp: (20 + Math.random() * 15).toFixed(1), unit: 'C', ts: Date.now() }),
    'sensor-hum-002': () => ({ hum: (40 + Math.random() * 40).toFixed(1), unit: '%', ts: Date.now() }),
    'energy-meter-003': () => ({ kwh: (100 + Math.random() * 50).toFixed(2), ts: Date.now() }),
    'pressure-004': () => ({ psi: (14 + Math.random() * 4).toFixed(2), ts: Date.now() }),
    'flow-005': () => ({ lpm: (10 + Math.random() * 5).toFixed(2), ts: Date.now() }),
  }
  const fn = base[device] ?? (() => ({ value: Math.random().toFixed(4), ts: Date.now() }))
  return JSON.stringify(fn())
}

/** Simple deterministic "hash" for display only — not crypto */
function fakeHash(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return '0x' + h.toString(16).padStart(8, '0') + Math.random().toString(16).slice(2, 18)
}

export default function IoTSimulator() {
  const [logs, setLogs] = useState<SimLog[]>([])
  const [running, setRunning] = useState(false)
  const [interval, setIntervalMs] = useState(1500)
  const counterRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addLog = useCallback(() => {
    const device = DEVICES[Math.floor(Math.random() * DEVICES.length)]
    const payload = randomPayload(device)
    const id = ++counterRef.current
    const ts = new Date().toLocaleTimeString('vi-VN')

    // Phase 1: hashing
    setLogs((prev) => [
      { id, ts, device, payload, hash: '...', status: 'hashing' },
      ...prev.slice(0, 29),
    ])

    // Phase 2: hash ready
    setTimeout(() => {
      const hash = fakeHash(payload)
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, hash, status: 'ready' } : l))
      )
    }, 400)
  }, [])

  const start = () => {
    if (running) return
    setRunning(true)
    addLog()
    timerRef.current = setInterval(addLog, interval)
  }

  const stop = () => {
    setRunning(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const clear = () => { stop(); setLogs([]); counterRef.current = 0 }

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Radio size={18} className={running ? 'text-emerald-400 animate-pulse' : ''} style={{ color: running ? undefined : 'var(--accent)' }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>IoT Middleware Simulator</span>
        <span className="ml-auto mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}>
          {logs.length} packets
        </span>
      </div>

      <p className="text-xs" style={{ color: 'var(--subtle)' }}>
        Giả lập 5 thiết bị IoT gửi dữ liệu cảm biến theo thời gian thực, hash payload và chuẩn bị relay lên blockchain.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={running ? stop : start}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: running ? 'var(--danger)' : 'var(--accent)',
            color: '#0d1b2f',
          }}
        >
          {running ? <Square size={14} /> : <Play size={14} />}
          {running ? 'Dừng' : 'Chạy Simulator'}
        </button>

        <button
          onClick={clear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-colors hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--subtle)' }}
        >
          <RefreshCw size={13} />
          Xoá
        </button>

        <div className="flex items-center gap-2 ml-auto text-xs" style={{ color: 'var(--subtle)' }}>
          <span>Interval:</span>
          <select
            value={interval}
            onChange={(e) => {
              const v = Number(e.target.value)
              setIntervalMs(v)
              if (running) {
                stop()
                setTimeout(() => {
                  setRunning(true)
                  timerRef.current = setInterval(addLog, v)
                }, 50)
              }
            }}
            className="rounded-lg px-2 py-1 text-xs border outline-none"
            style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <option value={800}>0.8s</option>
            <option value={1500}>1.5s</option>
            <option value={3000}>3s</option>
          </select>
        </div>
      </div>

      {/* Live feed */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--subtle)' }}>
            Nhấn "Chạy Simulator" để xem dữ liệu IoT theo thời gian thực.
          </p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl px-4 py-3 flex flex-col gap-1 border transition-all"
            style={{
              borderColor: log.status === 'ready' ? 'var(--border)' : 'rgba(172,198,233,0.3)',
              background: log.status === 'hashing' ? 'rgba(172,198,233,0.05)' : 'var(--surface-muted)',
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>{log.device}</span>
              <div className="flex items-center gap-2">
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{
                    background: log.status === 'ready' ? 'rgba(141,216,159,0.15)' : 'rgba(172,198,233,0.15)',
                    color: log.status === 'ready' ? 'var(--success)' : 'var(--accent)',
                  }}
                >
                  {log.status === 'hashing' ? 'hashing...' : 'ready'}
                </span>
                <span style={{ color: 'var(--subtle)' }}>{log.ts}</span>
              </div>
            </div>
            <div className="mono text-xs" style={{ color: 'var(--muted)' }}>{log.payload}</div>
            <div className="mono text-xs truncate" style={{ color: 'var(--subtle)' }}>
              hash: {log.hash}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl px-3 py-2 text-xs"
        style={{ background: 'var(--surface-muted)', color: 'var(--subtle)' }}
      >
        Đây là simulator frontend — để relay thật lên blockchain, middleware Node.js sẽ gọi <span className="mono" style={{ color: 'var(--accent)' }}>submitData()</span> sau mỗi packet.
      </div>
    </div>
  )
}
