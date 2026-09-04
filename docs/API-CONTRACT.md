# API Contract

## Philanthroffee Ordering System

> Complete API request/response contracts. Part of the Technical Specification.

---

## Response Format

All API responses follow this structure:

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Harga telah berubah",
    "details": { ... }
  }
}
```

### Error Codes

| Code | HTTP | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Auth required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | State conflict (price change, duplicate) |
| `SOLD_OUT` | 422 | Product no longer available |
| `INVALID_TRANSITION` | 422 | Invalid status transition |
| `CAFE_CLOSED` | 403 | Ordering not available |
| `TABLE_INVALID` | 404 | QR token invalid |
| `TABLE_DISABLED` | 403 | Table disabled |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Customer API

### GET /api/menu

Fetch full menu grouped by category.

**Query Parameters:**
- `branch_id` (optional, defaults to primary)

**Response: 200**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Coffee",
        "slug": "coffee",
        "products": [
          {
            "id": "uuid",
            "name": "Aren Latte",
            "description": "Espresso with aren sugar and fresh milk",
            "image_url": "https://...",
            "base_price": 28000,
            "availability": "AVAILABLE",
            "has_variants": true,
            "has_modifiers": true
          }
        ]
      }
    ]
  }
}
```

---

### GET /api/menu/:id

Fetch product detail with variants and modifiers.

**Response: 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Aren Latte",
    "description": "Espresso with aren sugar and fresh milk",
    "image_url": "https://...",
    "base_price": 28000,
    "availability": "AVAILABLE",
    "category": {
      "id": "uuid",
      "name": "Coffee"
    },
    "variants": [
      { "id": "uuid", "name": "Regular", "price_adjustment": 0 },
      { "id": "uuid", "name": "Large", "price_adjustment": 5000 }
    ],
    "modifier_groups": [
      {
        "id": "uuid",
        "name": "Sugar Level",
        "selection_type": "SINGLE",
        "is_required": true,
        "modifiers": [
          { "id": "uuid", "name": "0%", "price_adjustment": 0 },
          { "id": "uuid", "name": "50%", "price_adjustment": 0 },
          { "id": "uuid", "name": "Normal", "price_adjustment": 0 }
        ]
      },
      {
        "id": "uuid",
        "name": "Ice Level",
        "selection_type": "SINGLE",
        "is_required": false,
        "modifiers": [
          { "id": "uuid", "name": "No Ice", "price_adjustment": 0 },
          { "id": "uuid", "name": "Less Ice", "price_adjustment": 0 },
          { "id": "uuid", "name": "Normal Ice", "price_adjustment": 0 }
        ]
      },
      {
        "id": "uuid",
        "name": "Extras",
        "selection_type": "MULTIPLE",
        "is_required": false,
        "modifiers": [
          { "id": "uuid", "name": "Extra Shot", "price_adjustment": 5000 },
          { "id": "uuid", "name": "Oat Milk", "price_adjustment": 8000 }
        ]
      }
    ]
  }
}
```

---

### POST /api/tables/verify

Verify QR table token.

**Request:**

```json
{
  "table_number": "08",
  "token": "abc123xyz"
}
```

**Response: 200**

```json
{
  "success": true,
  "data": {
    "table_id": "uuid",
    "table_number": "08",
    "branch_id": "uuid"
  }
}
```

**Response: 404** — Invalid/expired token

**Response: 403** — Table disabled

---

### POST /api/orders

Create a new order.

**Headers:**
- `X-Idempotency-Key: uuid-v4`

**Request:**

```json
{
  "branch_id": "uuid",
  "order_type": "DINE_IN",
  "table_id": "uuid",
  "customer_name": "Andi",
  "customer_phone": "08123456789",
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "modifier_ids": ["uuid", "uuid"],
      "quantity": 1,
      "notes": "Extra hot please"
    }
  ],
  "notes": "Meja dekat jendela"
}
```

**Response: 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "PH1024",
    "status": "WAITING_PAYMENT",
    "order_type": "DINE_IN",
    "table_number": "08",
    "customer_name": "Andi",
    "items": [
      {
        "product_name": "Aren Latte",
        "variant_name": "Large",
        "modifiers": [
          { "group": "Sugar Level", "name": "50%", "price": 0 },
          { "group": "Ice Level", "name": "Less Ice", "price": 0 },
          { "group": "Extras", "name": "Extra Shot", "price": 5000 }
        ],
        "quantity": 1,
        "unit_price": 38000,
        "subtotal": 38000,
        "notes": "Extra hot please"
      }
    ],
    "subtotal": 38000,
    "total": 38000,
    "created_at": "2026-09-03T10:30:00Z"
  }
}
```

**Response: 409** — Price changed

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONFLICT",
    "message": "Harga telah berubah, silakan review ulang",
    "details": {
      "changed_items": [
        {
          "product_id": "uuid",
          "product_name": "Aren Latte",
          "old_price": 28000,
          "new_price": 30000
        }
      ]
    }
  }
}
```

**Response: 422** — Item sold out

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SOLD_OUT",
    "message": "Beberapa item sudah habis",
    "details": {
      "sold_out_items": [
        { "product_id": "uuid", "product_name": "Aren Latte" }
      ]
    }
  }
}
```

---

### GET /api/orders/:orderNumber

Get order detail for customer tracking.

**Response: 200**

```json
{
  "success": true,
  "data": {
    "order_number": "PH1024",
    "status": "PREPARING",
    "order_type": "DINE_IN",
    "table_number": "08",
    "customer_name": "Andi",
    "items": [ ... ],
    "total": 38000,
    "payment": {
      "method": "QRIS",
      "status": "PAID",
      "paid_at": "2026-09-03T10:32:00Z"
    },
    "timeline": [
      { "status": "WAITING_PAYMENT", "at": "2026-09-03T10:30:00Z" },
      { "status": "PAID", "at": "2026-09-03T10:32:00Z" },
      { "status": "PREPARING", "at": "2026-09-03T10:33:00Z" }
    ],
    "estimated_ready_at": "2026-09-03T10:41:00Z",
    "created_at": "2026-09-03T10:30:00Z"
  }
}
```

---

### POST /api/payments

Create payment transaction.

**Request:**

```json
{
  "order_id": "uuid",
  "payment_method": "QRIS"
}
```

**Response: 201**

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "order_number": "PH1024",
    "amount": 38000,
    "payment_method": "QRIS",
    "status": "PENDING",
    "snap_token": "midtrans-snap-token-xxx",
    "payment_url": "https://app.midtrans.com/snap/v4/...",
    "expires_at": "2026-09-03T11:30:00Z"
  }
}
```

---

### GET /api/payments/:orderNumber/status

Check payment status.

**Response: 200**

```json
{
  "success": true,
  "data": {
    "order_number": "PH1024",
    "payment_status": "PAID",
    "order_status": "PAID",
    "paid_at": "2026-09-03T10:32:00Z"
  }
}
```

---

### POST /api/payments/midtrans/webhook

Midtrans notification webhook (called by Midtrans).

**Request (from Midtrans):**

```json
{
  "transaction_time": "2026-09-03 10:32:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-tx-id",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "sha512hash...",
  "payment_type": "qris",
  "order_id": "PH1024-uuid",
  "merchant_id": "M123456",
  "gross_amount": "38000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response: 200**

```json
{ "status": "ok" }
```

---

## Staff API

All staff endpoints require `Authorization: Bearer <token>` header.

### GET /api/staff/orders

Get orders for KDS / cashier view.

**Query Parameters:**
- `status` — filter by status (comma-separated)
- `limit` — default 50
- `offset` — default 0

**Response: 200**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "PH1024",
        "status": "PAID",
        "order_type": "DINE_IN",
        "table_number": "08",
        "customer_name": "Andi",
        "items": [
          {
            "product_name": "Aren Latte",
            "variant_name": "Large",
            "modifiers": ["50% Sugar", "Less Ice", "Extra Shot"],
            "quantity": 1,
            "notes": "Extra hot please"
          }
        ],
        "total": 38000,
        "created_at": "2026-09-03T10:30:00Z",
        "elapsed_minutes": 3
      }
    ]
  },
  "meta": { "total": 12, "limit": 50, "offset": 0 }
}
```

---

### PATCH /api/staff/orders/:id/status

Update order status (KDS actions).

**Request:**

```json
{
  "status": "PREPARING"
}
```

**Response: 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "PH1024",
    "status": "PREPARING",
    "updated_at": "2026-09-03T10:33:00Z"
  }
}
```

**Response: 422** — Invalid transition

---

### POST /api/staff/payments/:id/confirm

Confirm cash payment (cashier only).

**Request:**

```json
{
  "notes": "Cash received Rp50.000, change Rp12.000"
}
```

**Response: 200**

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "PAID",
    "confirmed_by": "uuid",
    "paid_at": "2026-09-03T10:35:00Z"
  }
}
```

---

## Admin API

All admin endpoints require `Authorization: Bearer <token>` and ADMIN/OWNER role.

### Products

#### GET /api/staff/admin/products

**Query:** `?category_id=uuid&availability=AVAILABLE&search=latte`

**Response: 200** — List of products with full detail

#### POST /api/staff/admin/products

**Request:**

```json
{
  "category_id": "uuid",
  "name": "Aren Latte",
  "description": "Espresso with aren sugar",
  "base_price": 28000,
  "availability": "AVAILABLE",
  "variant_ids": ["uuid"],
  "modifier_group_ids": ["uuid", "uuid"]
}
```

#### PATCH /api/staff/admin/products/:id

Update product details.

#### PATCH /api/staff/admin/products/:id/availability

**Request:**

```json
{
  "availability": "SOLD_OUT"
}
```

---

### Categories

#### GET /api/staff/admin/categories
#### POST /api/staff/admin/categories
#### PATCH /api/staff/admin/categories/:id

---

### Orders

#### GET /api/staff/admin/orders

**Query:** `?status=PAID&payment_status=PENDING&date_from=2026-09-01&date_to=2026-09-03&order_type=DINE_IN&search=PH1024`

**Response: 200** — Paginated list with payment info

---

### Payments

#### GET /api/staff/admin/payments

**Query:** `?status=PENDING&date_from=2026-09-01`

#### POST /api/staff/admin/payments/:id/reconcile

**Response: 200**

```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "previous_status": "PENDING",
    "current_status": "PAID",
    "provider_status": "settlement",
    "reconciled_at": "2026-09-03T11:00:00Z"
  }
}
```

---

### Tables

#### GET /api/staff/admin/tables

**Response: 200**

```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": "uuid",
        "table_number": "08",
        "status": "ACTIVE",
        "qr_url": "https://order.philanthroffee.id/t/08?token=abc123",
        "created_at": "2026-09-01T00:00:00Z"
      }
    ]
  }
}
```

#### POST /api/staff/admin/tables

**Request:**

```json
{
  "table_number": "09"
}
```

#### PATCH /api/staff/admin/tables/:id

**Request:**

```json
{
  "status": "DISABLED"
}
```

#### POST /api/staff/admin/tables/:id/regenerate-qr

**Response: 200**

```json
{
  "success": true,
  "data": {
    "table_id": "uuid",
    "table_number": "08",
    "new_qr_url": "https://order.philanthroffee.id/t/08?token=newtoken456",
    "regenerated_at": "2026-09-03T11:00:00Z"
  }
}
```

---

### Settings

#### GET /api/staff/admin/settings

**Response: 200**

```json
{
  "success": true,
  "data": {
    "branch": {
      "name": "Philanthroffee",
      "ordering_paused": false,
      "dine_in_enabled": true,
      "pickup_enabled": true,
      "default_prep_time_minutes": 8
    },
    "operating_hours": [
      { "day": 0, "label": "Senin", "open": "08:00", "close": "22:00", "is_closed": false },
      { "day": 1, "label": "Selasa", "open": "08:00", "close": "22:00", "is_closed": false }
    ],
    "settings": {
      "timezone": "Asia/Jakarta",
      "currency": "IDR",
      "tax_rate": 0,
      "tax_included": true
    }
  }
}
```

#### PATCH /api/staff/admin/settings

**Request:**

```json
{
  "ordering_paused": true,
  "dine_in_enabled": true,
  "pickup_enabled": false,
  "default_prep_time_minutes": 10
}
```
