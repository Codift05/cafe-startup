<div align="center">

  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8H19C20.1046 8 21 8.89543 21 10V11C21 12.1046 20.1046 13 19 13H18V8Z" stroke="#E2725B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 8H18V14C18 16.2091 16.2091 18 14 18H6C3.79086 18 2 16.2091 2 14V8Z" stroke="#E2725B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 1V4" stroke="#C9A96E" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 1V4" stroke="#C9A96E" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 1V4" stroke="#C9A96E" stroke-width="2" stroke-linecap="round"/>
  </svg>

  <h1>Philanthroffee</h1>
  <p><strong>Modern, Frictionless & Realtime Cafe Web Ordering System</strong></p>

  <p>
    <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-v4.0.0-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white" alt="Nuxt 4" /></a>
    <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue.js-v3.5.0-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://midtrans.com"><img src="https://img.shields.io/badge/Midtrans-Payment-0052CC?style=for-the-badge&logo=fastapi&logoColor=white" alt="Midtrans" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-v3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>

  <p><em>Built for high-performance cafe operations: Scan QR ➔ Order ➔ Pay ➔ Track ➔ Done.</em></p>
</div>

<br />

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/compass.svg" width="22" height="22" /> Overview

**Philanthroffee** is an enterprise-grade web application designed for seamless in-cafe ordering. Built with **Nuxt 4**, **Supabase (PostgreSQL + Realtime)**, and **Midtrans Payment Gateway**, Philanthroffee optimizes cafe throughput by eliminating long queue times and simplifying barista order fulfillment.

<div align="center">
  <p><code>SCAN QR TABLE</code> &nbsp;➔&nbsp; <code>SELECT MENU</code> &nbsp;➔&nbsp; <code>PAY (QRIS / CASH)</code> &nbsp;➔&nbsp; <code>BARISTA KDS QUEUE</code> &nbsp;➔&nbsp; <code>SERVED</code></p>
</div>

### Key Architecture Principles
* **Direct Ordering**: Customers place orders immediately without login or mandatory account creation.
* **Server Source of Truth**: Item prices, stock availability, and order status transitions are strictly verified server-side.
* **Realtime Kitchen Display**: Baristas receive live order queue updates via Supabase Realtime WebSocket subscription.
* **Cryptographic Payment Security**: Webhook handlers use SHA-512 signature verification and idempotency keys to prevent duplicate transactions.

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/layers.svg" width="22" height="22" /> Features Breakdown

### 1. Customer Ordering Portal
* **Table QR Entry Flow**: Scanning a table QR automatically validates table token signature (`/t/:tableNumber?token=...`).
* **Pickup Support**: Direct web ordering mode for takeaway customers.
* **Dynamic Customization**: Product variants (Size), modifier groups (Ice, Sugar level, Extra Shots), and custom barista notes.
* **Persistent Cart**: Local storage state persistence with real-time recalculation.
* **Live Order Tracking**: Vertical order progress timeline page (`/order/:orderNumber`) with step-by-step updates.

### 2. Barista Kitchen Display System (KDS)
* **3-Column Kanban Queue**: Live order state categorization (**BARU / PAID** ➔ **DIBUAT / PREPARING** ➔ **SIAP / READY**).
* **Elapsed Time Monitor**: Realtime elapsed order timer highlighting priority orders.
* **State Machine Guard**: Strict state machine rules for valid order status transitions.

### 3. Admin & Operational Control Panel
* **Table & QR Management**: Add tables, generate QR Code data URLs, reset compromised tokens, and download QR table cards.
* **Payment Reconciliation**: Cashier cash payment confirmation & automated Midtrans status synchronization.
* **Emergency Operational Controls**: One-click **Pause Ordering** toggle for rush-hour overload management.

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg" width="22" height="22" /> Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 4](https://nuxt.com) (SSR/SPA) | Fullstack Vue 3 Meta-Framework |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | Modern Responsive UI & Custom Design Tokens |
| **Database & Realtime** | [Supabase](https://supabase.com) (PostgreSQL) | Data persistence, RLS policies & Row Level Realtime |
| **Payment Gateway** | [Midtrans](https://midtrans.com) Snap SDK | QRIS, E-Wallets (Gopay, OVO, ShopeePay) & Cash |
| **Validation** | [Zod](https://zod.dev) | Server-side API payload schema validation |
| **State Management** | Nuxt Composables | Reactive state management & cart persistence |

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/folder-tree.svg" width="22" height="22" /> Repository Structure

```text
philanthroffee/
├── app.vue                   # Core app root layout
├── composables/             # Reusable Vue composables (useCart, useAuth)
├── docs/                    # Architectural Specifications & Schemas
│   ├── PRD.md               # Product Requirements Document
│   ├── TECH-SPEC.md         # Engineering & Architecture Blueprints
│   ├── DATABASE-SCHEMA.md   # PostgreSQL DDL, ERD & Triggers
│   ├── API-CONTRACT.md      # REST API Specification
│   └── TASK-BREAKDOWN.md    # Atomic Tasks & Roadmap
├── pages/                   # Nuxt File-system Routing
│   ├── index.vue            # Customer Entry (Dine In vs Pickup)
│   ├── t/[tableNumber].vue  # QR Code Entry & Verification
│   ├── menu/                # Menu Browsing Page
│   ├── product/             # Item Customization Page
│   ├── cart/                # Cart Review Page
│   ├── checkout/            # Checkout & Customer Detail Form
│   ├── payment/             # Midtrans Snap & Cashier Payment Page
│   ├── order/               # Realtime Order Tracking Timeline
│   ├── staff/               # Barista KDS & Staff Login
│   └── admin/               # Admin Management Dashboard
├── server/                  # Server Engine & API Endpoints
│   ├── api/                 # REST API endpoints (Orders, Payments, Staff)
│   └── utils/               # Server Utilities (Price Calculator, Midtrans, Supabase)
├── types/                   # TypeScript interfaces & enums
└── utils/                   # Shared client-side helpers & constants
```

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/terminal.svg" width="22" height="22" /> Getting Started

### Prerequisites
* **Node.js**: `v18.x`, `v20.x`, or `v22.x`
* **Package Manager**: `npm`
* **Supabase Project**: Active PostgreSQL instance with database schema applied (`docs/DATABASE-SCHEMA.md`).

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Codift05/cafe-startup.git
cd cafe-startup
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxx
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js
MIDTRANS_IS_PRODUCTION=false

# App Settings
APP_URL=http://localhost:3000
DEFAULT_BRANCH_ID=11111111-1111-1111-1111-111111111111
```

### 3. Run Local Development Server

Start the Nuxt 4 development server:

```bash
npm run dev
```

Visit the application in your browser:
* **Customer Portal**: `http://localhost:3000`
* **Barista KDS**: `http://localhost:3000/staff/kds`
* **Admin Panel**: `http://localhost:3000/admin`

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/server.svg" width="22" height="22" /> API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tables/verify` | Verify QR table token | Public |
| `GET` | `/api/menu` | Fetch active menu categories & products | Public |
| `GET` | `/api/menu/:id` | Fetch detailed product with variants & modifiers | Public |
| `POST` | `/api/orders` | Create new order (idempotent, server price calc) | Public |
| `GET` | `/api/orders/:orderNumber` | Get order details & tracking status | Public |
| `POST` | `/api/payments` | Create payment transaction (Midtrans Snap / Cash) | Public |
| `GET` | `/api/payments/:orderNumber/status` | Check payment & order status | Public |
| `POST` | `/api/payments/midtrans/webhook` | Midtrans payment notification handler | Webhook |
| `GET` | `/api/staff/orders` | Fetch active order queue for KDS | Staff |
| `PATCH`| `/api/staff/orders/:id/status` | Advance order status in state machine | Staff |

---

## <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/user.svg" width="22" height="22" /> Author & Attribution

Developed with precision by **Miftahuddin Arsyad** ([@Codift05](https://github.com/Codift05)).

<div align="center">
  <a href="https://github.com/Codift05">
    <img src="https://github.com/Codift05.png" width="80" height="80" style="border-radius:50%;" alt="Miftahuddin Arsyad Profile"/>
    <br />
    <sub><b>Miftahuddin Arsyad</b> (@Codift05)</sub>
  </a>
</div>

<br />

---

<div align="center">
  <sub>© 2026 Philanthroffee Ordering System. All rights reserved.</sub>
</div>
