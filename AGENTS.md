# IoT x Blockchain Plan

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** - what Arc Studio remembers about building this app. It helps future agents (or humans) understand and extend the project.

---

## What This App Does

Kế hoạch và dashboard tích hợp IoT + Blockchain: đăng ký thiết bị IoT onchain, xác thực dữ liệu cảm biến bằng hash bất biến, thanh toán USDC micropayment tự động mỗi lần nộp dữ liệu.

## Deployed Contracts (Arc Testnet)

| Contract | Address | Explorer |
|---|---|---|
| IoTRegistry | 0xe49a15ca0b673e9a020653750206e14bf46a997c | https://explorer.testnet.arc.io/address/0xe49a15ca0b673e9a020653750206e14bf46a997c |
| DataVerifier | 0xb1eee7ff65adaae9874bcffbede2ab7035d595c2 | https://explorer.testnet.arc.io/address/0xb1eee7ff65adaae9874bcffbede2ab7035d595c2 |

- DataVerifier is wired to IoTRegistry + USDC (0x3600000000000000000000000000000000000000)
- Submission fee: 0.01 USDC (10000 at 6 decimals), withdrawable by owner

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```
