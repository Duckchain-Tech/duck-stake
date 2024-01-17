# duck-stake-be

Backend service for the **DuckChain Cross-Chain Staking Platform**. Handles wallet authentication, staking record management, a points/integral reward system, and real-time multi-source token price synchronization.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Background Services](#background-services)
- [Points System](#points-system)
- [Database Schema](#database-schema)
- [Multi-Chain Support](#multi-chain-support)

---

## Overview

`duck-stake-be` is a Node.js (ESM) REST API server that powers the DuckChain staking frontend. It provides:

- **Wallet-based authentication** via cryptographic signature verification for EVM, BTC, and TON chains.
- **Cross-chain staking record** ingestion by polling a canonical staking API and persisting deposit events.
- **Integral (points) reward calculation** — users earn points proportional to their staked asset value; referrers earn a 5% bonus.
- **Real-time token pricing** sourced from Binance spot prices and the OKX DEX API, cached in Redis.
- **Chain and token registry** auto-synced from the OKX chain list API daily.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Express HTTP Server                  │
│                        port 9009                         │
│                                                          │
│   /user/*  ──►  user_app.js   (auth, profile, invite)   │
│   /stack/* ──►  stack_app.js  (staking records)         │
│                                                          │
│   JWT middleware (express-jwt) on all protected routes   │
└──────────────────────────┬──────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
        MySQL2           Redis          Background
       (data)           (cache)          Workers
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
                    scannerStake    syncTokenPrice    integralCalculate
                    Data (18s)       (hourly)          (cron 0:00)
                                                            │
                                                     integralInAccount
                                                          (18s)
                                                     syncChainList
                                                         (daily)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Web Framework | Express.js 4.x |
| Database | MySQL 8 via `mysql2/promise` |
| Cache / Queue | Redis via `ioredis` + `generic-pool` |
| Authentication | `jsonwebtoken` + `express-jwt` |
| EVM chain | `web3` — signature recovery |
| BTC chain | `bitcore-lib` — ECDSA signature verification |
| TON chain | `tonweb` — address format conversion |
| Token Pricing | Binance Spot API + OKX DEX API (`crypto-js` for HMAC) |
| Scheduling | `node-schedule` (cron) |
| HTTP client | `axios` |
| Config | `dotenv` |
| Logging | `winston` (via `logUtil.js`) |

---

## Project Structure

```
duck-stake-be/
├── config/
│   └── config.js            # Centralized config loaded from .env
│
├── service/
│   ├── app.js               # Express entry point (port 9009)
│   ├── base_app.js          # Shared middleware: JWT auth, response helpers, IP util
│   ├── db.js                # MySQL2 connection pool wrapper
│   ├── redisService.js      # Redis pool + all Redis helper functions
│   ├── userService.js       # User registration, invite code logic
│   ├── stackService.js      # Cross-chain staking record queries
│   ├── tokenService.js      # Chain/token registry CRUD
│   ├── integralService.js   # Integral (points) aggregate queries
│   ├── user_app.js          # Express router: /user/* endpoints
│   ├── stack_app.js         # Express router: /stack/* endpoints
│   │
│   ├── eggs/                # Background worker scripts (spawned as separate processes)
│   │   ├── scannerStakeData.js    # Polls staking API, stores deposit events
│   │   ├── integralCalculate.js   # Calculates daily points from staked amounts
│   │   └── integralInAccount.js   # Credits calculated points to user balances
│   │
│   └── tokenPrice/          # Price sync background services
│       ├── syncTokenPrice.js      # Hourly token price refresh loop
│       └── syncChainList.js       # Daily chain list sync from OKX
│
├── util/
│   ├── jwtUtil.js           # JWT sign / verify / middleware
│   ├── SecretUtil.js        # Invite code generator (random alphanumeric)
│   ├── evmUtil.js           # EVM wallet signature verification via Web3
│   ├── btcUtil.js           # BTC ECDSA signature verification via bitcore-lib
│   ├── tonUtil.js           # TON address format conversion (raw ↔ bounceable)
│   ├── getTokenPrice.js     # Multi-source price fetch: Binance + OKX, Redis cache
│   ├── okxPrice.js          # OKX Web3 API client (HMAC-SHA256 auth)
│   ├── logUtil.js           # Winston logger instance
│   ├── DateTimeUtil.js      # Timestamp helpers (Unix, day range, etc.)
│   └── ArrayUtil.js         # Array and string utilities
│
├── package.json
├── package-lock.json
└── .gitignore
```

---

## Prerequisites

- **Node.js** >= 18 (ES Module support required)
- **MySQL** 8.x
- **Redis** 6.x or later
- Network access to:
  - Binance public API (`api.binance.com`)
  - OKX Web3 API (`www.okx.com`, `www.oklink.com`)
  - DuckChain staking bridge API

---

## Environment Variables

Create a `.env` file in the project root. All variables below are required.

```env
# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_DB_PORT=3306
MYSQL_DB_USER=root
MYSQL_DB_PASSWORD=your_password
DB_NAME=duck_stake

