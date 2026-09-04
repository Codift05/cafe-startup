// ============================================================
// GET /api/menu — Fetch full menu grouped by category
// ============================================================

export default defineEventHandler(async (_event) => {
  const supabase = useSupabaseAdmin()

  // Fetch active categories with their products
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (catError) {
    throw createError({ statusCode: 500, message: 'Gagal memuat kategori' })
  }

  // Fetch visible products (AVAILABLE + SOLD_OUT, not HIDDEN)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(`
      id, name, description, image_url, base_price, availability, category_id,
      product_variants(id),
      product_modifier_groups(id)
    `)
    .in('availability', ['AVAILABLE', 'SOLD_OUT'])
    .order('sort_order', { ascending: true })

  if (prodError) {
    throw createError({ statusCode: 500, message: 'Gagal memuat produk' })
  }

  // Group products by category
  const categoriesWithProducts = (categories || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    products: (products || [])
      .filter(p => p.category_id === cat.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        base_price: p.base_price,
        availability: p.availability,
        has_variants: (p.product_variants as any[])?.length > 0,
        has_modifiers: (p.product_modifier_groups as any[])?.length > 0,
      })),
  })).filter(cat => cat.products.length > 0) // Only show categories with products

  return {
    success: true,
    data: { categories: categoriesWithProducts },
  }
})
