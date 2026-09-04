// ============================================================
// Product Types & Enums
// ============================================================

export enum ProductAvailability {
  AVAILABLE = 'AVAILABLE',
  SOLD_OUT = 'SOLD_OUT',
  HIDDEN = 'HIDDEN',
}

export enum ModifierSelectionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
}

export interface CategoryWithProducts extends Category {
  products: ProductSummary[]
}

export interface ProductSummary {
  id: string
  name: string
  description: string | null
  image_url: string | null
  base_price: number
  availability: ProductAvailability
  has_variants: boolean
  has_modifiers: boolean
}

export interface Product extends ProductSummary {
  category: Pick<Category, 'id' | 'name'>
  variants: ProductVariant[]
  modifier_groups: ProductModifierGroup[]
}

export interface ProductVariant {
  id: string
  name: string
  price_adjustment: number
  sort_order: number
  is_active: boolean
}

export interface ProductModifierGroup {
  id: string
  name: string
  selection_type: ModifierSelectionType
  is_required: boolean
  min_selections: number
  max_selections: number | null
  sort_order: number
  modifiers: Modifier[]
}

export interface Modifier {
  id: string
  name: string
  price_adjustment: number
  sort_order: number
  is_active: boolean
}

// Availability labels
export const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  [ProductAvailability.AVAILABLE]: 'Tersedia',
  [ProductAvailability.SOLD_OUT]: 'Habis',
  [ProductAvailability.HIDDEN]: 'Disembunyikan',
}
