# Technical Specification

## Philanthroffee Ordering System

> Engineering reference document. See `PRD.md` for product requirements.
> See `DATABASE-SCHEMA.md` for full PostgreSQL schema.
> See `API-CONTRACT.md` for full API request/response contracts.
> See `TASK-BREAKDOWN.md` for implementation task list.

---

## 1. System Architecture

```text
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Customer    │     │  Staff      │     │  Admin       │
│  (Mobile)    │     │  (KDS/POS)  │     │  (Dashboard) │
└──────┬───────┘     └──────┬──────┘     └──────┬───────┘
       │                    │                    │
       └────────────┬───────┴────────────────────┘
                    │
            ┌───────▼────────┐
            │   Nuxt 4 SSR   │
            │   (Vercel)     │
            └───────┬────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
┌──────▼──────┐ ┌───▼───┐ ┌─────▼─────┐
│  Supabase   │ │ Supa  │ │ Supabase  │
│  PostgreSQL │ │ Auth  │ │ Realtime  │
└──────┬──────┘ └───────┘ └───────────┘
       │
┌──────▼──────┐
│  Supabase   │
│  Storage    │
└─────────────┘

External:
┌─────────────┐
│  Midtrans   │──── Webhook ────► POST /api/payments/midtrans/webhook
│  Payment    │
└─────────────┘
```

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Nuxt 4 + Vue 3 + TypeScript | SSR/SPA hybrid |
| Styling | Tailwind CSS + Nuxt UI | Component library |
| Backend | Nuxt Server Routes (Nitro) | API endpoints |
| Database | Supabase PostgreSQL | Primary data store |
| Auth | Supabase Auth | Staff authentication |
| Realtime | Supabase Realtime | Live order updates |
| Storage | Supabase Storage | Product images |
| Payment | Midtrans | QRIS, E-Wallet |
| Deployment | Vercel | Frontend + API hosting |

### 1.2 Folder Structure

```text
philanthroffee/
├── nuxt.config.ts
├── app.vue
├── pages/
│   ├── index.vue                          # Landing: Dine In / Pickup
│   ├── t/
│   │   └── [tableNumber].vue              # QR table entry → redirect to menu
│   ├── menu/
│   │   └── index.vue                      # Menu browsing
│   ├── product/
│   │   └── [id].vue                       # Product detail + customization
│   ├── cart/
│   │   └── index.vue                      # Cart review
│   ├── checkout/
│   │   └── index.vue                      # Checkout form
│   ├── payment/
│   │   └── [orderNumber].vue              # Payment page
│   ├── order/
│   │   └── [orderNumber].vue              # Order tracking
│   ├── staff/
│   │   ├── login.vue                      # Staff login
│   │   └── kds.vue                        # Kitchen Display System
│   └── admin/
│       ├── index.vue                      # Admin dashboard
│       ├── menu/
│       │   ├── index.vue                  # Menu management
│       │   └── [id].vue                   # Product edit
│       ├── categories/
│       │   └── index.vue                  # Category management
│       ├── orders/
│       │   ├── index.vue                  # Order list
│       │   └── [id].vue                   # Order detail
│       ├── payments/
│       │   └── index.vue                  # Payment management + reconciliation
│       ├── tables/
│       │   └── index.vue                  # Table & QR management
│       └── settings/
│           └── index.vue                  # Operational settings
├── components/
│   ├── menu/
│   │   ├── CategoryTabs.vue
│   │   ├── ProductCard.vue
│   │   └── ProductBadge.vue
│   ├── product/
│   │   ├── VariantSelector.vue
│   │   ├── ModifierGroup.vue
│   │   └── NotesInput.vue
│   ├── cart/
│   │   ├── CartItem.vue
│   │   ├── CartSummary.vue
│   │   └── CartFloatingBar.vue
│   ├── checkout/
│   │   ├── OrderSummary.vue
│   │   └── PaymentMethodSelector.vue
│   ├── order/
│   │   ├── OrderTimeline.vue
│   │   └── OrderStatusBadge.vue
│   ├── kds/
│   │   ├── KdsColumn.vue
│   │   ├── KdsOrderCard.vue
│   │   └── KdsTimer.vue
│   ├── admin/
│   │   ├── ProductForm.vue
│   │   ├── OrderTable.vue
│   │   ├── PaymentTable.vue
│   │   ├── TableQrCard.vue
│   │   └── ReconciliationAlert.vue
│   └── shared/
│       ├── AppHeader.vue
│       ├── LoadingSpinner.vue
│       ├── ErrorBoundary.vue
│       ├── EmptyState.vue
│       └── ConfirmDialog.vue
├── composables/
│   ├── useCart.ts                         # Cart state + localStorage persistence
│   ├── useOrder.ts                        # Order creation + tracking
│   ├── useMenu.ts                         # Menu fetching + filtering
│   ├── usePayment.ts                      # Payment flow
│   ├── useRealtime.ts                     # Supabase Realtime subscriptions
│   ├── useAuth.ts                         # Staff auth
│   ├── useTable.ts                        # Table context from QR
│   └── useBranchSettings.ts              # Operational settings
├── server/
│   ├── api/
│   │   ├── menu/
│   │   │   ├── index.get.ts              # GET /api/menu
│   │   │   └── [id].get.ts               # GET /api/menu/:id
│   │   ├── orders/
│   │   │   ├── index.post.ts             # POST /api/orders
│   │   │   └── [orderNumber].get.ts      # GET /api/orders/:orderNumber
│   │   ├── payments/
│   │   │   ├── index.post.ts             # POST /api/payments
│   │   │   ├── [orderNumber]/
│   │   │   │   └── status.get.ts         # GET /api/payments/:orderNumber/status
│   │   │   └── midtrans/
│   │   │       └── webhook.post.ts       # POST /api/payments/midtrans/webhook
│   │   ├── tables/
│   │   │   └── verify.post.ts            # POST /api/tables/verify
│   │   └── staff/
│   │       ├── orders/
│   │       │   ├── index.get.ts          # GET /api/staff/orders
│   │       │   └── [id]/
│   │       │       └── status.patch.ts   # PATCH /api/staff/orders/:id/status
│   │       └── admin/
│   │           ├── products/
│   │           │   ├── index.get.ts
│   │           │   ├── index.post.ts
│   │           │   ├── [id].patch.ts
│   │           │   └── [id]/
│   │           │       └── availability.patch.ts
│   │           ├── categories/
│   │           │   ├── index.get.ts
│   │           │   ├── index.post.ts
│   │           │   └── [id].patch.ts
│   │           ├── orders/
│   │           │   └── index.get.ts
│   │           ├── payments/
│   │           │   ├── index.get.ts
│   │           │   └── [id]/
│   │           │       └── reconcile.post.ts
│   │           ├── tables/
│   │           │   ├── index.get.ts
│   │           │   ├── index.post.ts
│   │           │   ├── [id].patch.ts
│   │           │   └── [id]/
│   │           │       └── regenerate-qr.post.ts
│   │           └── settings/
│   │               ├── index.get.ts
│   │               └── index.patch.ts
│   ├── utils/
│   │   ├── supabase.ts                   # Supabase client (server)
│   │   ├── midtrans.ts                   # Midtrans client
│   │   ├── auth.ts                       # Auth middleware helpers
│   │   ├── validation.ts                 # Zod schemas
│   │   ├── order-number.ts               # Order number generator
│   │   ├── price-calculator.ts           # Server-side price calc
│   │   └── idempotency.ts               # Idempotency key handling
│   └── tasks/
│       └── reconciliation.ts             # Background reconciliation
├── types/
│   ├── order.ts
│   ├── product.ts
│   ├── payment.ts
│   ├── table.ts
│   ├── user.ts
│   └── settings.ts
├── utils/
│   ├── currency.ts                       # Rp formatting
│   ├── date.ts                           # Date formatting
│   └── constants.ts                      # Shared constants
└── public/
    └── favicon.ico
```

---

## 2. Enums & Constants

### 2.1 Order Status

```typescript
enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

### 2.2 Order Type

```typescript
enum OrderType {
  DINE_IN = 'DINE_IN',
  PICKUP = 'PICKUP',
}
```

### 2.3 Payment Status

```typescript
enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}
```

### 2.4 Payment Method

```typescript
enum PaymentMethod {
  QRIS = 'QRIS',
  E_WALLET = 'E_WALLET',
  PAY_AT_CASHIER = 'PAY_AT_CASHIER',
}
```

### 2.5 Product Availability

```typescript
enum ProductAvailability {
  AVAILABLE = 'AVAILABLE',
  SOLD_OUT = 'SOLD_OUT',
  HIDDEN = 'HIDDEN',
}
```

### 2.6 Modifier Selection Type

```typescript
enum ModifierSelectionType {
  SINGLE = 'SINGLE',    // radio
  MULTIPLE = 'MULTIPLE', // checkbox
}
```

### 2.7 User Role

```typescript
enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  BARISTA = 'BARISTA',
}
```

### 2.8 Table Status

```typescript
enum TableStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}
```

---

## 3. State Machines

### 3.1 Order Status Transitions

```text
                    ┌──────────────┐
                    │WAITING_PAYMENT│
                    └───────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             │
        ┌──────────┐  ┌──────────┐        │
        │CANCELLED │  │   PAID   │        │
        └──────────┘  └────┬─────┘        │
                           │              │
                     ┌─────┴────┐         │
                     │          │         │
                     ▼          ▼         │
              ┌──────────┐ ┌──────────┐   │
              │PREPARING │ │CANCELLED │   │
              └────┬─────┘ └──────────┘   │
                   │                      │
                   ▼                      │
              ┌──────────┐                │
              │  READY   │                │
              └────┬─────┘                │
                   │                      │
                   ▼                      │
              ┌──────────┐                │
              │COMPLETED │                │
              └──────────┘                │
```

**Valid transitions:**

```typescript
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  WAITING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
```

### 3.2 Payment Status Transitions

```typescript
const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ['PAID', 'FAILED', 'EXPIRED'],
  PAID: ['REFUNDED'],
  FAILED: [],
  EXPIRED: [],
  REFUNDED: [],
};
```

### 3.3 Order↔Payment Status Sync

| Payment Event | Payment Status | Order Status |
|---|---|---|
| Payment created | PENDING | WAITING_PAYMENT |
| Webhook: settlement | PAID | PAID |
| Webhook: deny/cancel | FAILED | keep or CANCELLED |
| Webhook: expire | EXPIRED | CANCELLED |
| Cashier confirm | PAID | PAID |
| Admin reconcile → paid | PAID | PAID |

---

## 4. RBAC Permission Matrix

| Resource | OWNER | ADMIN | CASHIER | BARISTA |
|---|:---:|:---:|:---:|:---:|
| KDS (view/update orders) | ✅ | ✅ | ❌ | ✅ |
| Orders list | ✅ | ✅ | ✅ | ❌ |
| Order detail | ✅ | ✅ | ✅ | ✅* |
| Cash payment confirm | ✅ | ✅ | ✅ | ❌ |
| Payment list | ✅ | ✅ | ✅ | ❌ |
| Payment reconciliation | ✅ | ✅ | ❌ | ❌ |
| Menu CRUD | ✅ | ✅ | ❌ | ❌ |
| Set sold out | ✅ | ✅ | ❌ | ✅ |
| Category CRUD | ✅ | ✅ | ❌ | ❌ |
| Table management | ✅ | ✅ | ❌ | ❌ |
| QR regenerate | ✅ | ✅ | ❌ | ❌ |
| Branch settings | ✅ | ✅ | ❌ | ❌ |
| Operational settings | ✅ | ✅ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ |

*Barista only sees order detail via KDS context.

---

## 5. Idempotency Strategy

### 5.1 Order Creation

```text
Client generates: X-Idempotency-Key (UUIDv4)
Server checks:    idempotency_keys table
If exists:        return cached response
If not:           create order → store key + response
TTL:              24 hours
```

### 5.2 Webhook Processing

```text
Midtrans sends:   order_id + transaction_status
Server checks:    payment_events for duplicate
If processed:     return 200 OK (idempotent)
If new:           process → store event → return 200 OK
```

### 5.3 Payment Reconciliation

```text
Admin clicks:     "Reconcile"
Server checks:    last_reconciled_at < 30s ago?
If too recent:    skip (debounce)
If not:           check provider → update → log
```

---

## 6. Payment Flow Detail

### 6.1 Digital Payment (QRIS / E-Wallet)

```text
1. Customer clicks "Bayar"
2. Frontend: POST /api/orders (with idempotency key)
   → creates order #PH1024, status=WAITING_PAYMENT
3. Frontend: POST /api/payments
   → creates Midtrans transaction
   → returns snap_token / payment_url
4. Customer completes payment on Midtrans
5. Midtrans: POST /api/payments/midtrans/webhook
   → verify signature
   → check transaction_status
   → if "settlement": payment=PAID, order=PAID
6. Customer page receives realtime update
7. Order appears on KDS as "BARU"
```

### 6.2 Pay at Cashier

```text
1. Customer selects "Bayar di Kasir"
2. Frontend: POST /api/orders
   → creates order, status=WAITING_PAYMENT
3. Frontend: POST /api/payments (method=PAY_AT_CASHIER)
   → payment created, status=PENDING
4. Customer shows order number to cashier
5. Cashier: POST /api/staff/payments/:id/confirm
   → payment=PAID, order=PAID
6. Order appears on KDS
```

### 6.3 Webhook Verification

```typescript
// server/api/payments/midtrans/webhook.post.ts
function verifySignature(body: MidtransNotification): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(
      body.order_id +
      body.status_code +
      body.gross_amount +
      MIDTRANS_SERVER_KEY
    )
    .digest('hex');
  return hash === body.signature_key;
}
```

### 6.4 Midtrans Status Mapping

| Midtrans Status | PaymentStatus | OrderStatus |
|---|---|---|
| `pending` | PENDING | WAITING_PAYMENT |
| `settlement` / `capture` | PAID | PAID |
| `deny` / `cancel` | FAILED | keep / CANCELLED |
| `expire` | EXPIRED | CANCELLED |
| `refund` | REFUNDED | CANCELLED |

---

## 7. Realtime Subscriptions

### 7.1 Customer Order Tracking

```typescript
// Subscribe to specific order
supabase
  .channel('order-tracking')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `order_number=eq.${orderNumber}`,
  }, (payload) => {
    orderStatus.value = payload.new.status;
  })
  .subscribe();
```

### 7.2 KDS New Orders

```typescript
// Subscribe to all paid orders
supabase
  .channel('kds-orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `status=in.(PAID,PREPARING,READY)`,
  }, (payload) => {
    refreshKdsOrders();
  })
  .subscribe();
```

### 7.3 Menu Availability Changes

```typescript
// Subscribe to product availability
supabase
  .channel('menu-availability')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'products',
    filter: `availability=in.(AVAILABLE,SOLD_OUT)`,
  }, (payload) => {
    updateProductAvailability(payload.new);
  })
  .subscribe();
```

---

## 8. Security Implementation

### 8.1 Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/orders` | 5 req | 1 min per IP |
| `POST /api/payments` | 5 req | 1 min per IP |
| `POST /api/staff/login` | 10 req | 5 min per IP |
| `GET /api/payments/:id/status` | 30 req | 1 min per IP |
| `POST /api/payments/midtrans/webhook` | 100 req | 1 min (Midtrans IPs) |

### 8.2 Middleware Stack

```typescript
// Staff endpoints
defineEventHandler(async (event) => {
  // 1. Rate limit
  await rateLimit(event);
  
  // 2. Verify auth token
  const user = await requireAuth(event);
  
  // 3. Check role permission
  requireRole(user, ['OWNER', 'ADMIN']);
  
  // 4. Validate input (Zod)
  const body = await validateBody(event, schema);
  
  // 5. Process
  return handler(event, user, body);
});
```

### 8.3 Customer API Security

- No auth required for: menu, product detail
- Order creation: requires valid table token (dine-in) or pickup flag
- Order tracking: requires order_number (public but unguessable format)
- Payment status: requires order_number

### 8.4 Webhook Security

- Verify Midtrans signature hash
- Whitelist Midtrans IP ranges (production)
- Log all webhook events
- Return 200 even on processing error (prevent retry storm)

---

## 9. Error Recovery

### 9.1 Network Disconnect (Customer)

```text
Cart → localStorage (always persisted)
Order created → store order_number in localStorage
Payment pending → show "Jangan bayar ulang" message
Reconnect → check order status via API
```

### 9.2 Payment Stuck (Webhook Failed)

```text
Background task runs every 5 minutes:
  SELECT * FROM payments
  WHERE status = 'PENDING'
  AND created_at < NOW() - INTERVAL '5 minutes'

For each:
  → GET Midtrans transaction status
  → If settled: update payment + order
  → If expired: update payment + cancel order
  → Log reconciliation event
```

### 9.3 Price Changed During Checkout

```text
POST /api/orders:
  1. Recalculate all prices from database
  2. Compare with frontend total
  3. If mismatch: return 409 Conflict with new prices
  4. Frontend shows: "Harga telah berubah, silakan review"
  5. Customer confirms → retry with new prices
```

### 9.4 Sold Out During Checkout

```text
POST /api/orders:
  1. Check availability for all items
  2. If any SOLD_OUT: return 422 with item details
  3. Frontend shows: "Aren Latte sudah habis"
  4. Customer removes item → retry
```

---

## 10. Order Number Generation

```typescript
// Format: PH + 4-digit daily counter
// Example: PH1024

async function generateOrderNumber(branchId: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  // Atomic increment using PostgreSQL
  const { data } = await supabase.rpc('next_order_number', {
    p_branch_id: branchId,
    p_date: today,
  });
  
  return `PH${data.toString().padStart(4, '0')}`;
}

// PostgreSQL function
/*
CREATE OR REPLACE FUNCTION next_order_number(p_branch_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  INSERT INTO order_number_sequences (branch_id, order_date, last_number)
  VALUES (p_branch_id, p_date, 1)
  ON CONFLICT (branch_id, order_date)
  DO UPDATE SET last_number = order_number_sequences.last_number + 1
  RETURNING last_number INTO next_num;
  
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 11. Cart Persistence

```typescript
// composables/useCart.ts
const CART_STORAGE_KEY = 'philanthroffee_cart';

interface CartState {
  orderType: OrderType | null;
  tableId: string | null;
  tableNumber: string | null;
  items: CartItem[];
  updatedAt: string;
}

// Auto-save to localStorage on every change
watch(cart, (val) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(val));
}, { deep: true });

// Restore on mount
onMounted(() => {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as CartState;
    // Validate: if older than 4 hours, clear
    if (isExpired(parsed.updatedAt, 4 * 60 * 60 * 1000)) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    cart.value = parsed;
  }
});
```

---

## 12. QR Table Verification

```typescript
// POST /api/tables/verify
// Body: { tableNumber: string, token: string }

async function verifyTable(tableNumber: string, token: string) {
  const { data, error } = await supabase
    .from('tables')
    .select('id, table_number, status')
    .eq('table_number', tableNumber)
    .eq('qr_token', token)
    .single();

  if (!data) throw createError({ statusCode: 404, message: 'QR meja sudah tidak berlaku' });
  if (data.status === 'DISABLED') throw createError({ statusCode: 403, message: 'Meja ini sedang tidak aktif' });

  return { tableId: data.id, tableNumber: data.table_number };
}
```

---

## 13. Performance Targets

| Metric | Target |
|---|---|
| Menu load (first visit) | < 2s |
| Menu load (cached) | < 500ms |
| Product detail load | < 500ms |
| Order creation | < 1s |
| Payment creation | < 2s |
| Webhook processing | < 500ms |
| KDS refresh | < 500ms |
| Realtime delivery | < 1s |
| Admin page load | < 2s |

---

## 14. Audit Log Events

```typescript
enum AuditAction {
  STAFF_LOGIN = 'STAFF_LOGIN',
  STAFF_LOGOUT = 'STAFF_LOGOUT',
  MENU_PRICE_CHANGE = 'MENU_PRICE_CHANGE',
  MENU_AVAILABILITY_CHANGE = 'MENU_AVAILABILITY_CHANGE',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  CASH_PAYMENT_CONFIRMED = 'CASH_PAYMENT_CONFIRMED',
  PAYMENT_RECONCILED = 'PAYMENT_RECONCILED',
  QR_REGENERATED = 'QR_REGENERATED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
}
```

Audit log table stores: `id, user_id, action, entity_type, entity_id, old_value (JSONB), new_value (JSONB), ip_address, created_at`.
