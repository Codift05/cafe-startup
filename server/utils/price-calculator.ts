// ============================================================
// Server-side Price Calculator
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'

interface PriceCalculationItem {
  product_id: string
  variant_id: string | null
  modifier_ids: string[]
  quantity: number
}

interface CalculatedItem {
  product_id: string
  product_name: string
  product_image: string | null
  variant_id: string | null
  variant_name: string | null
  base_price: number
  variant_price: number
  modifier_details: {
    modifier_id: string
    modifier_name: string
    group_name: string
    price_adjustment: number
  }[]
  unit_price: number
  quantity: number
  subtotal: number
}

interface PriceCalculationResult {
  items: CalculatedItem[]
  subtotal: number
  total: number
  sold_out_items: { product_id: string; product_name: string }[]
  price_changed_items: { product_id: string; product_name: string; old_price: number; new_price: number }[]
}

/**
 * Calculate order prices from the database (server-side, source of truth).
 * Returns calculated items + any conflicts (sold out, price changes).
 */
export async function calculateOrderPrices(
  supabase: SupabaseClient,
  items: PriceCalculationItem[],
  _branchId: string,
): Promise<PriceCalculationResult> {
  const productIds = [...new Set(items.map(i => i.product_id))]
  const variantIds = [...new Set(items.filter(i => i.variant_id).map(i => i.variant_id!))]
  const modifierIds = [...new Set(items.flatMap(i => i.modifier_ids))]

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, base_price, availability, image_url')
    .in('id', productIds)

  // Fetch variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, name, price_adjustment, product_id')
    .in('id', variantIds.length > 0 ? variantIds : ['__none__'])

  // Fetch modifiers with group names
  const { data: modifiers } = await supabase
    .from('modifiers')
    .select('id, name, price_adjustment, modifier_group_id, modifier_groups(name)')
    .in('id', modifierIds.length > 0 ? modifierIds : ['__none__'])

  const productMap = new Map((products || []).map(p => [p.id, p]))
  const variantMap = new Map((variants || []).map(v => [v.id, v]))
  const modifierMap = new Map((modifiers || []).map(m => [m.id, m]))

  const calculatedItems: CalculatedItem[] = []
  const soldOutItems: PriceCalculationResult['sold_out_items'] = []
  const priceChangedItems: PriceCalculationResult['price_changed_items'] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product) {
      throw createError({ statusCode: 404, message: `Produk tidak ditemukan` })
    }

    // Check availability
    if (product.availability === 'SOLD_OUT') {
      soldOutItems.push({ product_id: product.id, product_name: product.name })
      continue
    }

    // Get variant
    const variant = item.variant_id ? variantMap.get(item.variant_id) : null

    // Get modifiers
    const modifierDetails = item.modifier_ids.map(mId => {
      const mod = modifierMap.get(mId)
      if (!mod) throw createError({ statusCode: 404, message: `Modifier tidak ditemukan` })
      return {
        modifier_id: mod.id,
        modifier_name: mod.name,
        group_name: (mod as any).modifier_groups?.name || '',
        price_adjustment: mod.price_adjustment,
      }
    })

    // Calculate unit price
    let unitPrice = product.base_price
    if (variant) unitPrice += variant.price_adjustment
    for (const mod of modifierDetails) unitPrice += mod.price_adjustment

    calculatedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_url,
      variant_id: variant?.id || null,
      variant_name: variant?.name || null,
      base_price: product.base_price,
      variant_price: variant?.price_adjustment || 0,
      modifier_details: modifierDetails,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: unitPrice * item.quantity,
    })
  }

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0)

  return {
    items: calculatedItems,
    subtotal,
    total: subtotal, // Tax can be added here
    sold_out_items: soldOutItems,
    price_changed_items: priceChangedItems,
  }
}
