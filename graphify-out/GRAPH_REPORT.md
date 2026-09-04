# Graph Report - Dev4caffe  (2026-09-04)

## Corpus Check
- 58 files · ~87,235 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 548 nodes · 588 edges · 52 communities (47 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3984d43`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Technical Specification
- product/[id].vue
- Schema Definitions
- dependencies
- Admin API
- Customer API
- 4. Target Users
- checkout/index.vue
- supabase.ts
- README.md
- order.ts
- useCart.ts
- order/[orderNumber].vue
- orders/index.post.ts
- payment.ts
- login.vue
- Task Breakdown
- admin/menu/index.vue
- Analysis & Cross-Check Document
- payment/[orderNumber].vue
- tables/index.vue
- currency.ts
- kds.vue
- auth.ts
- Phase 8: Admin Dashboard
- Phase 9: Edge Cases & Hardening
- orders/[id].vue
- orders/index.vue
- formatRp
- [tableNumber].vue
- OrderType
- Phase 0: Project Setup
- Phase 10: Polish & Deploy
- Phase 4: Order Creation & Payment
- settings/index.vue
- api.ts
- settings.ts
- date.ts
- taste-skill: The Anti-Slop Frontend Skill for AI Agents
- table.ts
- Phase 1: Menu & Product (Customer-facing)
- Phase 3: QR Table & Entry Points
- Phase 6: Barista KDS
- Phase 2: Cart & Checkout
- tsconfig.json
- taste-skill: The Anti-Slop Frontend Skill for AI Agents
- [id].get.ts
- menu/index.get.ts

## God Nodes (most connected - your core abstractions)
1. `Schema Definitions` - 22 edges
2. `Technical Specification` - 16 edges
3. `Task Breakdown` - 15 edges
4. `useCart()` - 9 edges
5. `Customer API` - 9 edges
6. `2. Enums & Constants` - 9 edges
7. `getSupabaseAdmin` - 8 edges
8. `formatRp` - 8 edges
9. `OrderType` - 7 edges
10. `Admin API` - 7 edges

## Surprising Connections (you probably didn't know these)
- `CartState` --references--> `OrderType`  [EXTRACTED]
  composables/useCart.ts → types/order.ts
- `useCart()` --calls--> `isExpired()`  [EXTRACTED]
  composables/useCart.ts → utils/date.ts
- `AuthenticatedUser` --references--> `UserRole`  [EXTRACTED]
  server/utils/auth.ts → types/user.ts

## Import Cycles
- None detected.

## Communities (52 total, 5 thin omitted)

### Community 0 - "Technical Specification"
Cohesion: 0.04
Nodes (47): 10. Order Number Generation, 11. Cart Persistence, 12. QR Table Verification, 13. Performance Targets, 14. Audit Log Events, 1.1 Technology Stack, 1.2 Folder Structure, 1. System Architecture (+39 more)

### Community 1 - "product/[id].vue"
Cohesion: 0.05
Nodes (34): activeCategory, { cart, itemCount, total, addItem, updateQuantity, removeItem }, categories, { data: menuData, pending, error }, filteredProducts, orderLabel, recommendedItems, router (+26 more)

### Community 2 - "Schema Definitions"
Cohesion: 0.06
Nodes (33): `audit_logs`, `auto_update_timestamp`, `branch_settings`, `branches`, `categories`, `cleanup_expired_idempotency_keys`, Database Schema, Entity Relationship Diagram (+25 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (33): midtrans-client, nuxt, @nuxt/devtools, @nuxt/ui, dependencies, midtrans-client, nuxt, @nuxt/ui (+25 more)

### Community 4 - "Admin API"
Cohesion: 0.09
Nodes (23): Admin API, Categories, GET /api/staff/admin/categories, GET /api/staff/admin/orders, GET /api/staff/admin/payments, GET /api/staff/admin/products, GET /api/staff/admin/settings, GET /api/staff/admin/tables (+15 more)

### Community 5 - "Customer API"
Cohesion: 0.10
Nodes (19): API Contract, Customer API, Error, Error Codes, GET /api/menu, GET /api/menu/:id, GET /api/orders/:orderNumber, GET /api/payments/:orderNumber/status (+11 more)

### Community 6 - "4. Target Users"
Cohesion: 0.10
Nodes (19): 1. Product Overview, 2. Product Goals, 3.1 Direct Ordering, 3.2 Minimal Interaction, 3.3 Payment Safety, 3.4 Operational Simplicity, 3. Product Principles, 4.1 Customer (+11 more)

### Community 7 - "checkout/index.vue"
Cohesion: 0.12
Nodes (13): createEmptyCart(), useCart(), clearCart(), removeItem(), updateQuantity(), cart, customerName, customerPhone (+5 more)

### Community 8 - "supabase.ts"
Cohesion: 0.18
Nodes (8): createPaymentSchema, createSnapTransaction(), getBaseUrl(), getMidtransConfig(), getTransactionStatus(), MidtransConfig, verifyMidtransSignature(), getSupabaseAdmin

### Community 9 - "README.md"
Cohesion: 0.12
Nodes (15): 1. Customer Ordering Portal, 1. Installation, 2. Barista Kitchen Display System (KDS), 2. Environment Configuration, 3. Admin & Operational Control Panel, 3. Run Local Development Server, <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/compass.svg" width="22" height="22" /> Overview, <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg" width="22" height="22" /> Tech Stack & Architecture (+7 more)

### Community 10 - "order.ts"
Cohesion: 0.14
Nodes (13): statusSchema, CreateOrderItemRequest, CreateOrderRequest, KDS_COLUMN_LABELS, Order, ORDER_STATUS_LABELS, ORDER_TRANSITIONS, OrderItem (+5 more)

### Community 11 - "useCart.ts"
Cohesion: 0.21
Nodes (11): cart, CartItem, CartItemModifier, isInitialized, CART_STORAGE_KEY, CART_TTL_MS, DEFAULT_PREP_TIME_MINUTES, IDEMPOTENCY_TTL_MS (+3 more)

### Community 12 - "order/[orderNumber].vue"
Cohesion: 0.18
Nodes (6): isLoading, order, orderNumber, route, router, statusOrder

### Community 13 - "orders/index.post.ts"
Cohesion: 0.22
Nodes (8): createOrderSchema, generateOrderNumber(), CalculatedItem, calculateOrderPrices(), PriceCalculationItem, PriceCalculationResult, DEFAULT_BRANCH_ID, ORDER_NUMBER_PREFIX

### Community 14 - "payment.ts"
Cohesion: 0.18
Nodes (10): CreatePaymentRequest, CreatePaymentResponse, MidtransNotification, Payment, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_TRANSITIONS, PaymentMethod (+2 more)

### Community 15 - "login.vue"
Cohesion: 0.22
Nodes (5): useAuth(), auth, email, errorMsg, password

### Community 16 - "Task Breakdown"
Cohesion: 0.20
Nodes (9): Estimated Timeline (1 developer), Phase 5: Order Tracking (Customer), Phase 7: Staff Auth, Philanthroffee Ordering System — Implementation Plan, T-500: Order Tracking Page, T-700: Staff Login, T-701: Auth Middleware, Task Breakdown (+1 more)

### Community 17 - "admin/menu/index.vue"
Cohesion: 0.20
Nodes (7): categories, filteredProducts, newProduct, products, searchQuery, selectedCategory, showAddModal

### Community 18 - "Analysis & Cross-Check Document"
Cohesion: 0.22
Nodes (8): 1. Executive Summary & Verification Status, 2. Comprehensive Traceability Matrix, 3. Visual & Aesthetic Architecture Audit (Google Stitch Compliance), 4. Technical Architecture & Security Audit, 5. Verification Checklist, Analysis & Cross-Check Document, Design Tokens Used:, Philanthroffee Ordering System — Alignment & Traceability Matrix

### Community 19 - "payment/[orderNumber].vue"
Cohesion: 0.25
Nodes (7): checkStatus(), isLoading, openSnap(), order, orderNumber, route, router

### Community 20 - "tables/index.vue"
Cohesion: 0.25
Nodes (3): newTableNumber, showAddModal, tablesList

### Community 21 - "currency.ts"
Cohesion: 0.29
Nodes (4): { cart, itemCount, total, isEmpty, removeItem, updateQuantity }, orderLabel, router, formatRupiah()

### Community 22 - "kds.vue"
Cohesion: 0.29
Nodes (6): baruOrders, fetchOrders(), orders, sedangDibuatOrders, siapOrders, updateStatus()

### Community 23 - "auth.ts"
Cohesion: 0.32
Nodes (4): AuthenticatedUser, ROLE_LABELS, User, UserRole

### Community 24 - "Phase 8: Admin Dashboard"
Cohesion: 0.29
Nodes (7): Phase 8: Admin Dashboard, T-800: Admin Layout, T-801: Menu Management, T-802: Order Management, T-803: Payment Management, T-804: Table & QR Management, T-805: Settings

### Community 25 - "Phase 9: Edge Cases & Hardening"
Cohesion: 0.29
Nodes (7): Phase 9: Edge Cases & Hardening, T-900: Payment Recovery, T-901: Duplicate Prevention, T-902: Network Error Handling, T-903: Menu Availability Realtime, T-904: Rate Limiting, T-905: Audit Logging

### Community 26 - "orders/[id].vue"
Cohesion: 0.29
Nodes (4): isLoading, order, orderNumber, route

### Community 27 - "orders/index.vue"
Cohesion: 0.29
Nodes (4): filteredOrders, orders, selectedStatus, statusOptions

### Community 28 - "formatRp"
Cohesion: 0.29
Nodes (4): isReconciling, mismatchCount, paymentList, formatRp

### Community 29 - "[tableNumber].vue"
Cohesion: 0.29
Nodes (6): errorMsg, loading, route, router, { setOrderContext }, tableNumber

### Community 30 - "OrderType"
Cohesion: 0.33
Nodes (4): CartState, router, { setOrderContext }, OrderType

### Community 31 - "Phase 0: Project Setup"
Cohesion: 0.33
Nodes (6): Phase 0: Project Setup, T-000: Initialize Nuxt 4 Project, T-001: Supabase Setup, T-002: Database Schema Migration, T-003: TypeScript Types & Enums, T-004: Shared Utilities

### Community 32 - "Phase 10: Polish & Deploy"
Cohesion: 0.33
Nodes (6): Phase 10: Polish & Deploy, T-1000: UI/UX Polish, T-1001: SEO & Meta, T-1002: Performance, T-1003: Deployment, T-1004: Acceptance Testing

### Community 33 - "Phase 4: Order Creation & Payment"
Cohesion: 0.33
Nodes (6): Phase 4: Order Creation & Payment, T-400: Order Creation API, T-401: Midtrans Integration, T-402: Payment Page, T-403: Midtrans Webhook, T-404: Payment Status API

### Community 34 - "settings/index.vue"
Cohesion: 0.33
Nodes (4): defaultPrepTime, dineInEnabled, isPaused, pickupEnabled

### Community 35 - "api.ts"
Cohesion: 0.33
Nodes (5): ApiError, ApiResponse, ApiResult, ERROR_CODES, PaginationMeta

### Community 36 - "settings.ts"
Cohesion: 0.33
Nodes (5): BranchConfig, BranchSettings, DAY_LABELS, OperatingHour, SettingsResponse

### Community 38 - "taste-skill: The Anti-Slop Frontend Skill for AI Agents"
Cohesion: 0.40
Nodes (4): 🎨 1. Taste Principles (UI/UX), 💻 2. Desktop & Mobile Architecture, Overview & Core Philosophy, taste-skill: The Anti-Slop Frontend Skill for AI Agents

### Community 39 - "table.ts"
Cohesion: 0.40
Nodes (4): Table, TableStatus, VerifyTableRequest, VerifyTableResponse

### Community 40 - "Phase 1: Menu & Product (Customer-facing)"
Cohesion: 0.50
Nodes (4): Phase 1: Menu & Product (Customer-facing), T-100: Menu API, T-101: Menu Page, T-102: Product Detail Page

### Community 41 - "Phase 3: QR Table & Entry Points"
Cohesion: 0.50
Nodes (4): Phase 3: QR Table & Entry Points, T-300: QR Table Verification API, T-301: QR Entry Page, T-302: Landing Page

### Community 42 - "Phase 6: Barista KDS"
Cohesion: 0.50
Nodes (4): Phase 6: Barista KDS, T-600: KDS Orders API, T-601: KDS Status Update API, T-602: KDS Page

### Community 43 - "Phase 2: Cart & Checkout"
Cohesion: 0.67
Nodes (3): Phase 2: Cart & Checkout, T-200: Cart System, T-201: Checkout Page

## Knowledge Gaps
- **342 isolated node(s):** `CartItem`, `CartItemModifier`, `cart`, `isInitialized`, `name` (+337 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatRp` connect `formatRp` to `checkout/index.vue`, `order/[orderNumber].vue`, `admin/menu/index.vue`, `payment/[orderNumber].vue`, `currency.ts`, `orders/[id].vue`, `orders/index.vue`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `Task Breakdown` connect `Task Breakdown` to `Phase 10: Polish & Deploy`, `Phase 4: Order Creation & Payment`, `Phase 1: Menu & Product (Customer-facing)`, `Phase 3: QR Table & Entry Points`, `Phase 6: Barista KDS`, `Phase 2: Cart & Checkout`, `Phase 8: Admin Dashboard`, `Phase 9: Edge Cases & Hardening`, `Phase 0: Project Setup`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `getSupabaseAdmin` connect `supabase.ts` to `order.ts`, `orders/index.post.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `useCart()` (e.g. with `addItem()` and `calculateUnitPrice()`) actually correct?**
  _`useCart()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CartItem`, `CartItemModifier`, `cart` to the rest of the system?**
  _342 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Technical Specification` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `product/[id].vue` be split into smaller, more focused modules?**
  _Cohesion score 0.05087881591119334 - nodes in this community are weakly interconnected._