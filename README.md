<div align="center">

  <h1>☕ Philanthroffee</h1>
  <p><strong>Modern, Frictionless & Realtime Cafe Web Ordering System</strong></p>

  <p>
    <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-v4.0.0-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt 4" /></a>
    <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue.js-v3.5.0-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://midtrans.com"><img src="https://img.shields.io/badge/Midtrans-Payment-0052CC?style=for-the-badge&logo=midtrans&logoColor=white" alt="Midtrans" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-v3.4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-v5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>

  <sub>Built with ❤️ for modern cafe operations. Scan QR ➔ Order ➔ Pay ➔ Track ➔ Done.</sub>
</div>

<br />

---

## 🌟 Overview

**Philanthroffee** is an enterprise-grade web application designed for seamless in-cafe ordering. Built with **Nuxt 4**, **Supabase (PostgreSQL + Realtime)**, and **Midtrans Payment Gateway**, Philanthroffee optimizes cafe throughput by eliminating long queue times and simplifying barista order fulfillment.

```text
  📱 SCAN QR MEJA   ➔   ☕ PILIH MENU   ➔   💳 BAYAR (QRIS/KASIR)   ➔   👨‍🍳 BARISTA KDS   ➔   ✨ SELESAI
```

### ⚡ Key Principles
- 🚀 **Direct Ordering**: Customers do not need to register or log in to place an order.
- 🔐 **Server Source of Truth**: Pricing, availability, and state transitions are strictly calculated and validated on the backend.
- ⚡ **Realtime Kitchen Display**: Baristas receive instantaneous order notifications on the live KDS Kanban board.
- 🛡️ **Idempotent Payments**: Prevents duplicate payment processing with cryptographic webhook signature verification and idempotency keys.

---

## ✨ Features Breakdown

### 📱 1. Customer Ordering Portal
* **Table QR Entry Flow**: Scanning a table QR automatically validates the table token and binds the session (`/t/:tableNumber?token=...`).
* **Pickup Support**: Direct web ordering option for takeaway customers.
* **Dynamic Menu & Product Customization**: Custom variants (Size), modifier groups (Ice, Sugar level, Extra Shots), and custom notes for baristas.
* **Persistent Cart**: Persistent cart state managed via local state with auto-reconciliation.
* **Order & Payment Verification**: Realtime status tracking screen (`/order/:orderNumber`) with step-by-step progress timeline.

### 👨‍🍳 2. Barista KDS (Kitchen Display System)
* **3-Column Kanban Queue**: Realtime view categorizing orders into **BARU (PAID)** ➔ **DIBUAT (PREPARING)** ➔ **SIAP (READY)**.
* **Elapsed Time Tracker**: Visual indicators highlighting order queue times.
* **State Machine Validation**: Prevents invalid status transitions.

### ⚙️ 3. Admin & Operational Control Panel
* **Table & QR Management**: Add tables, generate QR Code data URLs, reset compromised tokens, and print QR table cards.
* **Payment Reconciliation**: Cashier cash payment confirmation & automated Midtrans status synchronization.
* **Emergency Operational Controls**: One-click **Pause Ordering** toggle for rush hour overload management.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 4](https://nuxt.com) (SSR/SPA) | Fullstack Vue 3 Meta-Framework |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) + Nuxt UI | Modern, Responsive Dark UI Design System |
| **Database & Realtime** | [Supabase](https://supabase.com) (PostgreSQL) | Data persistence, RLS policies & Row Level Realtime |
| **Payment Gateway** | [Midtrans](https://midtrans.com) Snap SDK | QRIS, Gopay, OVO, ShopeePay & Virtual Account |
| **Validation** | [Zod](https://zod.dev) | Server-side schema validation |
| **State Management** | Nuxt Composables | Reusable local state & cart persistence |

---

## 📁 Repository Structure

```text
philanthroffee/
├── 📄 app.vue                   # Core app root layout
├── 📁 composables/             # Reusable Vue composables (useCart, useAuth)
├── 📁 docs/                    # Architectural Specifications & Schemas
│   ├── 📜 PRD.md               # Product Requirements Document
│   ├── 📜 TECH-SPEC.md         # Engineering & Architecture Blueprints
│   ├── 📜 DATABASE-SCHEMA.md   # PostgreSQL DDL, ERD & Triggers
│   ├── 📜 API-CONTRACT.md      # REST API Specification
│   └── 📜 TASK-BREAKDOWN.md    # Atomic Tasks & Roadmap
├── 📁 pages/                   # Nuxt File-system Routing
│   ├── 📄 index.vue            # Customer Entry (Dine In vs Pickup)
│   ├── 📄 t/[tableNumber].vue  # QR Code Entry & Verification
│   ├── 📁 menu/                # Menu Browsing Page
│   ├── 📁 product/             # Item Customization Page
│   ├── 📁 cart/                # Cart Review Page
│   ├── 📁 checkout/            # Checkout & Customer Detail Form
│   ├── 📁 payment/             # Midtrans Snap & Cashier Payment Page
│   ├── 📁 order/               # Realtime Order Tracking Timeline
│   ├── 📁 staff/               # Barista KDS & Staff Login
│   └── 📁 admin/               # Admin Management Dashboard
├── 📁 server/                  # Server Engine & API Endpoints
│   ├── 📁 api/                 # REST API endpoints (Orders, Payments, Staff)
│   └── 📁 utils/               # Server Utilities (Price Calculator, Midtrans, Supabase)
├── 📁 types/                   # TypeScript interfaces & enums
└── 📁 utils/                   # Shared client-side helpers & constants
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.x` or `v20.x` / `v22.x`
* **Package Manager**: `npm` or `pnpm`
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
* 🛒 **Customer Portal**: `http://localhost:3000`
* 👨‍🍳 **Barista KDS**: `http://localhost:3000/staff/kds`
* 📊 **Admin Panel**: `http://localhost:3000/admin`

---

## 📡 API Endpoints Overview

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

## 👨‍💻 Author & Attribution

Developed with passion by **Miftahuddin Arsyad** ([@Codift05](https://github.com/Codift05)).

<div align="center">
  <a href="https://github.com/Codift05">
    <img src="https://github.com/Codift05.png" width="80px;" style="border-radius:50%;" alt="Miftahuddin Arsyad Profile"/>
    <br />
    <sub><b>Miftahuddin Arsyad</b> (@Codift05)</sub>
  </a>
</div>

<br />

---

<div align="center">
  <sub>© 2026 Philanthroffee Ordering System. All rights reserved.</sub>
</div>
