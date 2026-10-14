import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Cpu,
  Globe,
  Shield,
  Zap,
  Database,
  Link,
  Activity,
  Server,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  Lock,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import {
  IOT_REGISTRY,
  DATA_VERIFIER,
  EXPLORER_ADDR as EXPLORER,
  fmtUsdc,
} from './contracts'
import RegisterDevice from './components/RegisterDevice'
import SubmitData from './components/SubmitData'
import SubmissionList from './components/SubmissionList'
import IoTSimulator from './components/IoTSimulator'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Phase {
  id: number
  title: string
  period: string
  status: 'completed' | 'in-progress' | 'planned'
  objective: string
  tasks: string[]
  tech: string[]
  kpi: string
}

interface Layer {
  icon: React.ReactNode
  title: string
  desc: string
  examples: string[]
  color: string
}

interface UseCase {
  title: string
  desc: string
  icon: React.ReactNode
  benefit: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: 1,
    title: 'Khảo sát & Thiết kế Kiến trúc',
    period: 'Tháng 1 – 2',
    status: 'planned',
    objective: 'Xác định bài toán, lựa chọn nền tảng blockchain và chuẩn giao tiếp IoT.',
    tasks: [
      'Phân tích nghiệp vụ và xác định luồng dữ liệu IoT cần xác thực',
      'Đánh giá các blockchain phù hợp (Arc, Ethereum, Polygon, Hyperledger)',
      'Thiết kế sơ đồ kiến trúc tầng IoT ↔ Middleware ↔ Blockchain',
      'Định nghĩa chuẩn dữ liệu (JSON schema, payload signature)',
      'Lập kế hoạch bảo mật khóa riêng tư trên thiết bị IoT',
    ],
    tech: ['MQTT / AMQP', 'Ethereum / Arc Testnet', 'Foundry', 'Node.js / Bun'],
    kpi: 'Tài liệu thiết kế được phê duyệt, PoC testnet hoạt động',
  },
  {
    id: 2,
    title: 'Phát triển Smart Contract & Middleware',
    period: 'Tháng 3 – 5',
    status: 'planned',
    objective: 'Viết smart contract lưu trữ & xác thực dữ liệu IoT, xây dựng lớp trung gian.',
    tasks: [
      'Viết smart contract IoTRegistry (đăng ký thiết bị, lưu hash dữ liệu)',
      'Viết smart contract DataVerifier (xác minh chữ ký, trigger alert)',
      'Kiểm thử và audit contract (Foundry + slither)',
      'Xây dựng Middleware: nhận MQTT → hash → gửi transaction lên chain',
      'Tích hợp Circle USDC để thanh toán dữ liệu giữa các node',
    ],
    tech: ['Solidity', 'Foundry', 'MQTT Broker', 'viem / wagmi', 'Circle USDC'],
    kpi: 'Contract deploy thành công trên testnet, 100 tx/giờ không lỗi',
  },
  {
    id: 3,
    title: 'Tích hợp Thiết bị IoT & Thử nghiệm',
    period: 'Tháng 6 – 8',
    status: 'planned',
    objective: 'Kết nối thiết bị thật, chạy thử nghiệm tại môi trường thực tế.',
    tasks: [
      'Flash firmware cho thiết bị IoT (ESP32 / Raspberry Pi)',
      'Cài đặt secure enclave / TPM để bảo vệ private key trên thiết bị',
      'Triển khai hệ thống trên môi trường staging (AWS IoT / Azure IoT Hub)',
      'Chạy load test: 1.000 thiết bị gửi dữ liệu đồng thời',
      'Kiểm thử tấn công: replay attack, data tampering, man-in-the-middle',
    ],
    tech: ['ESP32 / Raspberry Pi', 'AWS IoT Core', 'TPM 2.0', 'Grafana / Prometheus'],
    kpi: 'Độ trễ end-to-end < 3s, tỷ lệ xác thực thành công > 99.5%',
  },
  {
    id: 4,
    title: 'Dashboard Giám sát & Phân tích',
    period: 'Tháng 9 – 10',
    status: 'planned',
    objective: 'Xây dựng giao diện theo dõi thiết bị và dữ liệu onchain theo thời gian thực.',
    tasks: [
      'Xây dựng dashboard React hiển thị trạng thái thiết bị theo thời gian thực',
      'Tích hợp truy vấn sự kiện onchain (event indexer hoặc The Graph)',
      'Hiển thị lịch sử giao dịch và hash dữ liệu với explorer link',
      'Cảnh báo (alert) khi thiết bị gửi dữ liệu bất thường lên chain',
      'Báo cáo chi phí gas và đề xuất tối ưu',
    ],
    tech: ['React / Vite', 'wagmi + viem', 'The Graph', 'Circle USDC', 'Sonner / Recharts'],
    kpi: 'Dashboard live < 2s latency, 0 downtime trong 30 ngày liên tục',
  },
  {
    id: 5,
    title: 'Production Deploy & Vận hành',
    period: 'Tháng 11 – 12',
    status: 'planned',
    objective: 'Triển khai mainnet, bàn giao tài liệu vận hành và kế hoạch mở rộng.',
    tasks: [
      'Audit bảo mật smart contract lần cuối (bên thứ ba độc lập)',
      'Deploy contract lên mainnet (Arc hoặc Polygon)',
      'Thiết lập CI/CD pipeline cho firmware và contract upgrades',
      'Viết runbook vận hành, quy trình xử lý sự cố',
      'Lập roadmap v2: oracle, AI anomaly detection, cross-chain data market',
    ],
    tech: ['Arc Mainnet / Polygon', 'GitHub Actions', 'PagerDuty', 'Circle USDC'],
    kpi: 'Hệ thống stable 99.9% uptime, < 0.01 USDC chi phí gas/tx trung bình',
  },
]

const LAYERS: Layer[] = [
  {
    icon: <Radio size={20} />,
    title: 'Tầng Thiết bị IoT',
    desc: 'Cảm biến, actuator ký số liệu bằng private key riêng.',
    examples: ['ESP32 / Raspberry Pi', 'MQTT / CoAP', 'TPM 2.0 secure enclave'],
    color: 'text-blue-400',
  },
  {
    icon: <Server size={20} />,
    title: 'Tầng Middleware',
    desc: 'Nhận dữ liệu, hash và relay transaction lên blockchain.',
    examples: ['Node.js / Bun broker', 'IPFS / Arweave lưu payload', 'Queue & retry logic'],
    color: 'text-purple-400',
  },
  {
    icon: <Layers size={20} />,
    title: 'Tầng Blockchain',
    desc: 'Smart contract xác thực, lưu trữ bất biến, trigger tự động.',
    examples: ['IoTRegistry contract', 'DataVerifier contract', 'USDC micropayment'],
    color: 'text-cyan-400',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Tầng Ứng dụng',
    desc: 'Dashboard giám sát, báo cáo, tích hợp hệ thống doanh nghiệp.',
    examples: ['React dashboard', 'Event indexer / The Graph', 'REST / Webhook API'],
    color: 'text-emerald-400',
  },
]

const USE_CASES: UseCase[] = [
  {
    title: 'Chuỗi Cung ứng Thực phẩm',
    desc: 'Ghi nhận nhiệt độ, độ ẩm từ kho lạnh lên blockchain mỗi 5 phút. Không thể giả mạo, truy xuất nguồn gốc tức thì.',
    icon: <Globe size={18} />,
    benefit: 'Giảm gian lận 40%, thời gian kiểm tra giảm 80%',
  },
  {
    title: 'Hạ tầng Năng lượng',
    desc: 'Đồng hồ điện thông minh ghi lượng tiêu thụ lên chain. Thanh toán tự động bằng USDC theo hợp đồng thông minh.',
    icon: <Zap size={18} />,
    benefit: 'Tự động hóa 100% quy trình thanh toán',
  },
  {
    title: 'Y tế & Thiết bị Theo dõi',
    desc: 'Dữ liệu bệnh nhân từ wearable được hash và lưu chain — riêng tư nhờ zero-knowledge, nhưng xác thực được.',
    icon: <Activity size={18} />,
    benefit: 'Tuân thủ HIPAA/GDPR, bệnh nhân kiểm soát dữ liệu',
  },
  {
    title: 'Nhà máy Thông minh (IIoT)',
    desc: 'Robot, máy CNC báo cáo trạng thái bảo trì lên blockchain. Hợp đồng tự động kích hoạt lệnh sửa chữa và thanh toán.',
    icon: <Cpu size={18} />,
    benefit: 'Giảm downtime 30%, thanh toán nhà cung cấp tức thì',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Phase['status'] }) {
  const map = {
    completed: { label: 'Hoàn thành', icon: <CheckCircle size={12} />, cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
    'in-progress': { label: 'Đang thực hiện', icon: <Activity size={12} />, cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
    planned: { label: 'Kế hoạch', icon: <Clock size={12} />, cls: 'text-blue-300 bg-blue-300/10 border-blue-300/30' },
  }
  const { label, icon, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {icon}
      {label}
    </span>
  )
}

function PhaseCard({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold display"
            style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}
          >
            {phase.id}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                {phase.title}
              </span>
              <StatusBadge status={phase.status} />
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
              <Clock size={11} />
              {phase.period}
            </div>
          </div>
        </div>
        <div style={{ color: 'var(--subtle)', flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-sm pt-4" style={{ color: 'var(--muted)' }}>
            {phase.objective}
          </p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--subtle)' }}>
              Nhiệm vụ
            </p>
            <ul className="space-y-1.5">
              {phase.tasks.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink-2)' }}>
                  <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-emerald-400/70" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {phase.tech.map((t) => (
              <span
                key={t}
                className="mono text-xs px-2 py-0.5 rounded-md border"
                style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: 'var(--surface-muted)' }}
              >
                {t}
              </span>
            ))}
          </div>

          <div
            className="rounded-xl p-3 flex items-start gap-2 text-sm"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
          >
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-yellow-400/80" />
            <span><span className="font-semibold" style={{ color: 'var(--ink-2)' }}>KPI: </span>{phase.kpi}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Onchain Live Panel ───────────────────────────────────────────────────────

function ContractLivePanel() {
  const [liveTab, setLiveTab] = useState<'interact' | 'logs' | 'simulator'>('interact')

  const { data: totalSubmissions, isLoading: loadSubs } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'totalSubmissions',
  })
  const { data: submissionFee, isLoading: loadFee } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'submissionFee',
  })
  const { data: accruedFees, isLoading: loadAccrued } = useReadContract({
    ...DATA_VERIFIER,
    functionName: 'accruedFees',
  })

  const stats = [
    {
      label: 'Tổng submissions',
      value: loadSubs ? '...' : String(typeof totalSubmissions === 'bigint' ? totalSubmissions : 0),
      color: 'text-cyan-400',
    },
    {
      label: 'Phí / lần nộp',
      value: loadFee ? '...' : `${fmtUsdc(submissionFee as bigint | undefined)} USDC`,
      color: 'text-blue-400',
    },
    {
      label: 'Phí tích lũy',
      value: loadAccrued ? '...' : `${fmtUsdc(accruedFees as bigint | undefined)} USDC`,
      color: 'text-emerald-400',
    },
  ]

  const contracts = [
    { name: 'IoTRegistry', address: IOT_REGISTRY.address },
    { name: 'DataVerifier', address: DATA_VERIFIER.address },
  ]

  const liveTabs = [
    { id: 'interact' as const, label: 'Tương tác' },
    { id: 'logs' as const, label: 'Submissions' },
    { id: 'simulator' as const, label: 'Simulator' },
  ]

  return (
    <div className="pb-12 space-y-4">

      {/* Wallet + stats row */}
      <div
        className="rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex flex-wrap gap-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs" style={{ color: 'var(--subtle)' }}>{s.label}</p>
              <p className={`display text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <ConnectKitButton />
      </div>

      {/* Contract addresses */}
      <div
        className="rounded-2xl border px-4 py-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {contracts.map((c) => (
            <div key={c.name} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-muted)' }}>
                <Database size={12} style={{ color: 'var(--accent)' }} />
              </div>
              <span className="font-medium text-xs" style={{ color: 'var(--ink)' }}>{c.name}</span>
              <span className="mono text-xs truncate" style={{ color: 'var(--subtle)' }}>
                {c.address.slice(0, 10)}...{c.address.slice(-4)}
              </span>
              <a href={`${EXPLORER}${c.address}`} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
                <ExternalLink size={10} />Arc
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {liveTabs.map((t) => (
          <button key={t.id} onClick={() => setLiveTab(t.id)}
            className="px-4 py-2 text-sm font-medium rounded-t-lg transition-all"
            style={{
              color: liveTab === t.id ? 'var(--accent)' : 'var(--subtle)',
              background: liveTab === t.id ? 'var(--surface-strong)' : 'transparent',
              borderBottom: liveTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {liveTab === 'interact' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RegisterDevice />
          <SubmitData />
        </div>
      )}

      {liveTab === 'logs' && <SubmissionList />}

      {liveTab === 'simulator' && <IoTSimulator />}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<'plan' | 'arch' | 'usecases' | 'live'>('plan')

  const tabs: { id: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'plan', label: 'Kế hoạch Triển khai', icon: <Database size={15} /> },
    { id: 'arch', label: 'Kiến trúc Hệ thống', icon: <Layers size={15} /> },
    { id: 'usecases', label: 'Ứng dụng Thực tế', icon: <Globe size={15} /> },
    { id: 'live', label: 'Contract Live', icon: <Activity size={15} /> },
  ]

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-gradient)' }}>
      {/* ─── Hero ─── */}
      <div
        className="border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent)', color: '#0d1b2f' }}
            >
              <Link size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
                Kế hoạch dự án
              </p>
              <h1 className="display text-xl font-bold" style={{ color: 'var(--ink)' }}>
                IoT x Blockchain
              </h1>
            </div>
          </div>
          <p className="text-sm max-w-xl" style={{ color: 'var(--muted)' }}>
            Tích hợp thiết bị IoT với nền tảng blockchain để xác thực dữ liệu bất biến, tự động hoá thanh toán USDC và tăng cường bảo mật dữ liệu cảm biến theo thời gian thực.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-5">
            {[
              { label: 'Thời gian', value: '12 tháng', icon: <Clock size={14} /> },
              { label: 'Giai đoạn', value: '5 phase', icon: <Layers size={14} /> },
              { label: 'Mạng', value: 'Arc Testnet → Mainnet', icon: <Shield size={14} /> },
              { label: 'Token', value: 'USDC', icon: <Zap size={14} /> },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-strong)' }}
              >
                <span style={{ color: 'var(--subtle)' }}>{s.icon}</span>
                <span style={{ color: 'var(--subtle)' }}>{s.label}:</span>
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-1 pt-5 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all"
              style={{
                color: activeTab === t.id ? 'var(--accent)' : 'var(--subtle)',
                background: activeTab === t.id ? 'var(--surface-strong)' : 'transparent',
                borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Kế hoạch ─── */}
        {activeTab === 'plan' && (
          <div className="space-y-3 pb-12">
            <p className="text-sm mb-4" style={{ color: 'var(--subtle)' }}>
              Nhấn vào mỗi giai đoạn để xem chi tiết nhiệm vụ, công nghệ và KPI.
            </p>
            {PHASES.map((p) => (
              <PhaseCard key={p.id} phase={p} />
            ))}
          </div>
        )}

        {/* ─── Tab: Kiến trúc ─── */}
        {activeTab === 'arch' && (
          <div className="pb-12">
            <p className="text-sm mb-6" style={{ color: 'var(--subtle)' }}>
              Hệ thống được chia thành 4 tầng độc lập, giao tiếp qua giao thức chuẩn.
            </p>

            {/* Architecture diagram (text-based) */}
            <div
              className="rounded-2xl border p-5 mb-6 overflow-x-auto"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--subtle)' }}>
                Luồng dữ liệu
              </p>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[
                  { label: 'Cảm biến IoT', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                  { label: '→', color: 'text-gray-500', bg: '' },
                  { label: 'MQTT / CoAP', color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  { label: '→', color: 'text-gray-500', bg: '' },
                  { label: 'Middleware (Hash + Sign)', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                  { label: '→', color: 'text-gray-500', bg: '' },
                  { label: 'Blockchain Tx', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: '→', color: 'text-gray-500', bg: '' },
                  { label: 'Smart Contract', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                  { label: '→', color: 'text-gray-500', bg: '' },
                  { label: 'Dashboard / API', color: 'text-pink-400', bg: 'bg-pink-400/10' },
                ].map((item, i) => (
                  item.bg ? (
                    <span key={i} className={`mono px-2 py-1 rounded-lg ${item.bg} ${item.color} font-medium`}>
                      {item.label}
                    </span>
                  ) : (
                    <span key={i} className={item.color}>{item.label}</span>
                  )
                ))}
              </div>
            </div>

            {/* Layer cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {LAYERS.map((layer, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <div className={`flex items-center gap-2 mb-2 ${layer.color}`}>
                    {layer.icon}
                    <span className="font-semibold text-sm">{layer.title}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{layer.desc}</p>
                  <ul className="space-y-1">
                    {layer.examples.map((ex) => (
                      <li key={ex} className="mono text-xs flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
                        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${layer.color} bg-current`} />
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div
              className="mt-5 rounded-2xl border p-5 flex items-start gap-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <Lock size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>
                  Bảo mật khóa riêng tư trên thiết bị IoT
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Private key được lưu trong TPM 2.0 hoặc secure enclave. Thiết bị ký payload trước khi gửi — middleware không bao giờ tiếp cận khóa. Nếu thiết bị bị đánh cắp, contract có thể thu hồi (revoke) device ID mà không ảnh hưởng toàn hệ thống.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Ứng dụng ─── */}
        {activeTab === 'usecases' && (
          <div className="pb-12">
            <p className="text-sm mb-6" style={{ color: 'var(--subtle)' }}>
              Bốn lĩnh vực ứng dụng ưu tiên cho năm đầu triển khai.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {USE_CASES.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-5"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--accent)' }}>
                    {uc.icon}
                    <span className="font-semibold text-sm">{uc.title}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>{uc.desc}</p>
                  <div
                    className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-2"
                    style={{ background: 'var(--surface-muted)', color: 'var(--success)' }}
                  >
                    <CheckCircle size={12} />
                    {uc.benefit}
                  </div>
                </div>
              ))}
            </div>

            {/* USDC integration highlight */}
            <div
              className="mt-5 rounded-2xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--accent)' }}>
                <Zap size={18} />
                <span className="font-semibold text-sm">Tích hợp Circle USDC</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: 'Micropayment tự động', desc: 'Thiết bị IoT nhận USDC khi cung cấp dữ liệu đúng chuẩn cho marketplace.' },
                  { title: 'Thanh toán smart contract', desc: 'Hợp đồng tự giải ngân USDC khi điều kiện cảm biến được xác nhận onchain.' },
                  { title: 'Phí giao dịch ổn định', desc: 'Arc Testnet dùng USDC làm gas — chi phí dự đoán được, không biến động.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl p-3"
                    style={{ background: 'var(--surface-muted)' }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--ink-2)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--subtle)' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Contract Live ─── */}
        {activeTab === 'live' && <ContractLivePanel />}
      </div>
    </div>
  )
}
