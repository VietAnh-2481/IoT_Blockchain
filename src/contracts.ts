import IoTRegistryArtifact from '../contracts/out/IoTRegistry.sol/IoTRegistry.json'
import DataVerifierArtifact from '../contracts/out/DataVerifier.sol/DataVerifier.json'

export const ARC_TESTNET_CHAIN_ID = 5042002
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const
export const EXPLORER_TX = 'https://explorer.testnet.arc.io/tx/'
export const EXPLORER_ADDR = 'https://explorer.testnet.arc.io/address/'

export const IOT_REGISTRY = {
  address: '0xe49a15ca0b673e9a020653750206e14bf46a997c' as const,
  abi: IoTRegistryArtifact.abi,
  chainId: ARC_TESTNET_CHAIN_ID,
}

export const DATA_VERIFIER = {
  address: '0xb1eee7ff65adaae9874bcffbede2ab7035d595c2' as const,
  abi: DataVerifierArtifact.abi,
  chainId: ARC_TESTNET_CHAIN_ID,
}

export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

/** Convert bigint raw USDC (6 dec) to display string */
export function fmtUsdc(raw: bigint | undefined): string {
  if (raw === undefined) return '—'
  return (Number(raw) / 1_000_000).toFixed(4)
}

/** keccak256-like deterministic bytes32 from a string (client-side, not crypto) */
export function strToBytes32(s: string): `0x${string}` {
  const enc = new TextEncoder().encode(s.slice(0, 31).padEnd(32, '\0'))
  let hex = '0x'
  enc.forEach((b) => { hex += b.toString(16).padStart(2, '0') })
  return hex as `0x${string}`
}

/** Hex-encode arbitrary string as bytes */
export function strToBytes(s: string): `0x${string}` {
  let hex = '0x'
  for (let i = 0; i < s.length; i++) {
    hex += s.charCodeAt(i).toString(16).padStart(2, '0')
  }
  return hex as `0x${string}`
}
