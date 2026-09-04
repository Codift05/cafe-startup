// ============================================================
// Cart Composable — Client-side cart with localStorage persistence
// ============================================================

import { ref, computed, watch } from 'vue'
import type { ProductVariant, Modifier } from '~/types/product'
import { OrderType } from '~/types/order'
import { CART_STORAGE_KEY, CART_TTL_MS, MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from '~/utils/constants'
import { isExpired } from '~/utils/date'

export interface CartItem {
  /** Unique cart item ID (generated client-side) */
  cartItemId: string
  productId: string
  productName: string
  productImage: string | null
  variantId: string | null
  variantName: string | null
  basePrice: number
  variantPrice: number
  modifiers: CartItemModifier[]
  quantity: number
  unitPrice: number
  notes: string
}

export interface CartItemModifier {
  modifierId: string
  modifierName: string
  groupName: string
  priceAdjustment: number
}

export interface CartState {
  orderType: OrderType | null
  tableId: string | null
  tableNumber: string | null
  branchId: string | null
  items: CartItem[]
  updatedAt: string
}

function createEmptyCart(): CartState {
  return {
    orderType: null,
    tableId: null,
    tableNumber: null,
    branchId: null,
    items: [],
    updatedAt: new Date().toISOString(),
  }
}

const cart = ref<CartState>(createEmptyCart())
const isInitialized = ref(false)

export function useCart() {
  // ---- Restore from localStorage on first call ----
  if (import.meta.client && !isInitialized.value) {
    isInitialized.value = true
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CartState
        if (parsed.updatedAt && !isExpired(parsed.updatedAt, CART_TTL_MS)) {
          cart.value = parsed
        } else {
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY)
    }

    // Auto-persist on every change
    watch(cart, (val) => {
      val.updatedAt = new Date().toISOString()
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })
  }

  // ---- Computed ----
  const itemCount = computed(() =>
    cart.value.items.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    cart.value.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  )

  const total = computed(() => subtotal.value) // Tax logic can be added here

  const isEmpty = computed(() => cart.value.items.length === 0)

  const isDineIn = computed(() => cart.value.orderType === OrderType.DINE_IN)

  // ---- Methods ----

  function setOrderContext(orderType: OrderType, tableId?: string, tableNumber?: string, branchId?: string) {
    cart.value.orderType = orderType
    cart.value.tableId = tableId || null
    cart.value.tableNumber = tableNumber || null
    cart.value.branchId = branchId || null
  }

  function addItem(item: Omit<CartItem, 'cartItemId'>) {
    if (cart.value.items.length >= MAX_CART_ITEMS) {
      throw new Error(`Maksimal ${MAX_CART_ITEMS} item dalam keranjang`)
    }

    const cartItemId = crypto.randomUUID()
    cart.value.items.push({ ...item, cartItemId })
  }

  function removeItem(cartItemId: string) {
    cart.value.items = cart.value.items.filter(i => i.cartItemId !== cartItemId)
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    const item = cart.value.items.find(i => i.cartItemId === cartItemId)
    if (!item) return

    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    if (quantity > MAX_ITEM_QUANTITY) return

    item.quantity = quantity
  }

  function clearCart() {
    cart.value = createEmptyCart()
    if (import.meta.client) {
      localStorage.removeItem(CART_STORAGE_KEY)
    }
  }

  /**
   * Calculate unit price for a product configuration.
   */
  function calculateUnitPrice(
    basePrice: number,
    variant: ProductVariant | null,
    selectedModifiers: Modifier[],
  ): number {
    let price = basePrice
    if (variant) price += variant.price_adjustment
    for (const mod of selectedModifiers) {
      price += mod.price_adjustment
    }
    return price
  }

  return {
    cart: computed(() => cart.value),
    itemCount,
    subtotal,
    total,
    isEmpty,
    isDineIn,
    setOrderContext,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    calculateUnitPrice,
  }
}
