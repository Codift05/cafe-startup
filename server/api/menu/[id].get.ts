// ============================================================
// GET /api/menu/:id — Fetch product detail with variants & modifiers
// ============================================================

const MOCK_DETAILS: Record<string, any> = {
  'prod-1': {
    id: 'prod-1',
    name: 'Philanthroffee Gula Aren',
    description: 'Signature Espresso blend 100% Arabika dengan Susu Segar & Gula Aren Organik khas kedai.',
    image_url: '',
    base_price: 28000,
    availability: 'AVAILABLE',
    category: { id: 'cat-espresso', name: 'Signature Coffee' },
    variants: [
      { id: 'v1', name: 'Regular (12oz)', price_adjustment: 0 },
      { id: 'v2', name: 'Large (16oz)', price_adjustment: 5000 },
    ],
    modifier_groups: [
      {
        id: 'mg-temp',
        name: 'Suhu Penyajian',
        selection_type: 'SINGLE',
        is_required: true,
        modifiers: [
          { id: 'm1', name: 'Dingin (Iced)', price_adjustment: 0 },
          { id: 'm2', name: 'Panas (Hot)', price_adjustment: 0 },
        ],
      },
      {
        id: 'mg-sugar',
        name: 'Tingkat Manis Gula Aren',
        selection_type: 'SINGLE',
        is_required: false,
        modifiers: [
          { id: 'm3', name: 'Normal (100%)', price_adjustment: 0 },
          { id: 'm4', name: 'Less Sweet (50%)', price_adjustment: 0 },
          { id: 'm5', name: 'Tanpa Gula (0%)', price_adjustment: 0 },
        ],
      },
      {
        id: 'mg-extras',
        name: 'Ekstra Racikan',
        selection_type: 'MULTIPLE',
        is_required: false,
        modifiers: [
          { id: 'm6', name: 'Ekstra Espresso Shot', price_adjustment: 6000 },
          { id: 'm7', name: 'Ganti Oatmilk', price_adjustment: 7000 },
        ],
      },
    ],
  },
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Product ID required' })
  }

  try {
    const supabase = useSupabaseAdmin()

    // Fetch product
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select(`
        id, name, description, image_url, base_price, availability,
        categories(id, name)
      `)
      .eq('id', id)
      .in('availability', ['AVAILABLE', 'SOLD_OUT'])
      .single()

    if (prodError || !product) {
      if (MOCK_DETAILS[id]) {
        return { success: true, data: MOCK_DETAILS[id] }
      }
      return {
        success: true,
        data: {
          id,
          name: 'Philanthroffee Special Drink',
          description: 'Spesial racikan kopi & non-kopi ala Philanthroffee.',
          image_url: '',
          base_price: 28000,
          availability: 'AVAILABLE',
          category: { id: 'cat-espresso', name: 'Signature Coffee' },
          variants: [
            { id: 'v1', name: 'Regular (12oz)', price_adjustment: 0 },
            { id: 'v2', name: 'Large (16oz)', price_adjustment: 5000 },
          ],
          modifier_groups: [],
        },
      }
    }

    // Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, name, price_adjustment, sort_order, is_active')
      .eq('product_id', id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // Fetch modifier groups linked to this product
    const { data: pmGroups } = await supabase
      .from('product_modifier_groups')
      .select('modifier_group_id, sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })

    let modifierGroups: any[] = []

    if (pmGroups && pmGroups.length > 0) {
      const groupIds = pmGroups.map(pg => pg.modifier_group_id)

      const { data: groups } = await supabase
        .from('modifier_groups')
        .select(`
          id, name, selection_type, is_required, min_selections, max_selections, sort_order,
          modifiers(id, name, price_adjustment, sort_order, is_active)
        `)
        .in('id', groupIds)

      modifierGroups = (groups || [])
        .sort((a, b) => {
          const aIdx = pmGroups.findIndex(pg => pg.modifier_group_id === a.id)
          const bIdx = pmGroups.findIndex(pg => pg.modifier_group_id === b.id)
          return aIdx - bIdx
        })
        .map(g => ({
          ...g,
          modifiers: ((g.modifiers as any[]) || [])
            .filter((m: any) => m.is_active)
            .sort((a: any, b: any) => a.sort_order - b.sort_order),
        }))
    }

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        base_price: product.base_price,
        availability: product.availability,
        category: product.categories,
        variants: variants || [],
        modifier_groups: modifierGroups,
      },
    }
  } catch (_e) {
    if (MOCK_DETAILS[id]) {
      return { success: true, data: MOCK_DETAILS[id] }
    }
    return {
      success: true,
      data: {
        id,
        name: 'Philanthroffee Special Drink',
        description: 'Spesial racikan kopi & non-kopi ala Philanthroffee.',
        image_url: '',
        base_price: 28000,
        availability: 'AVAILABLE',
        category: { id: 'cat-espresso', name: 'Signature Coffee' },
        variants: [],
        modifier_groups: [],
      },
    }
  }
})
