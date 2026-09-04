// ============================================================
// GET /api/menu/:id — Fetch product detail with variants & modifiers
// ============================================================

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Product ID required' })
  }

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
    throw createError({ statusCode: 404, message: 'Produk tidak ditemukan' })
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

    // Sort groups by product_modifier_groups sort_order and filter active modifiers
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
})
