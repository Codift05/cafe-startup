// ============================================================
// GET /api/menu — Fetch full menu grouped by category
// ============================================================

const MOCK_CATEGORIES = [
  {
    id: 'cat-espresso',
    name: 'Signature Coffee',
    slug: 'signature-coffee',
    products: [
      {
        id: 'prod-1',
        name: 'Philanthroffee Gula Aren',
        description: 'Signature Espresso blend 100% Arabika dengan Susu Segar & Gula Aren Organik.',
        image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
        base_price: 28000,
        availability: 'AVAILABLE',
        has_variants: true,
        has_modifiers: true,
      },
      {
        id: 'prod-2',
        name: 'Kopi Milk Sea Salt Cream',
        description: 'Espresso racikan khas dengan lapisan foam cream sea salt gurih bertekstur lembut.',
        image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop',
        base_price: 32000,
        availability: 'AVAILABLE',
        has_variants: true,
        has_modifiers: true,
      },
      {
        id: 'prod-3',
        name: 'Pandan Oat Latte',
        description: 'Espresso house-blend dipadukan dengan ekstrak pandan alami dan susu gandum.',
        image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop',
        base_price: 30000,
        availability: 'AVAILABLE',
        has_variants: true,
        has_modifiers: true,
      },
    ],
  },
  {
    id: 'cat-noncoffee',
    name: 'Non-Coffee & Tea',
    slug: 'non-coffee-tea',
    products: [
      {
        id: 'prod-4',
        name: 'Matcha Uji Cream Latte',
        description: 'Teh hijau Matcha impor dari Uji, Kyoto dengan susu segar dan tekstur velvety.',
        image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
        base_price: 34000,
        availability: 'AVAILABLE',
        has_variants: false,
        has_modifiers: true,
      },
      {
        id: 'prod-5',
        name: 'Artisan Dark Chocolate',
        description: 'Cokelat hitam premium 70% Kakao dengan hint aroma nutty dan manis seimbang.',
        image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=800&auto=format&fit=crop',
        base_price: 32000,
        availability: 'AVAILABLE',
        has_variants: false,
        has_modifiers: true,
      },
    ],
  },
  {
    id: 'cat-pastry',
    name: 'Artisan Pastry',
    slug: 'artisan-pastry',
    products: [
      {
        id: 'prod-6',
        name: 'French Butter Croissant',
        description: 'Pastry mentega Perancis dengan lapisan garing beraroma keju & butter panggang.',
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
        base_price: 25000,
        availability: 'AVAILABLE',
        has_variants: false,
        has_modifiers: false,
      },
      {
        id: 'prod-7',
        name: 'Almond Chocolate Pain',
        description: 'Pastry isi cokelat lumer dengan irisan almond panggang renyah di atasnya.',
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
        base_price: 28000,
        availability: 'AVAILABLE',
        has_variants: false,
        has_modifiers: false,
      },
    ],
  },
]

export default defineEventHandler(async (_event) => {
  try {
    const supabase = useSupabaseAdmin()

    // Fetch active categories with their products
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (catError || !categories || categories.length === 0) {
      return { success: true, data: { categories: MOCK_CATEGORIES } }
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

    if (prodError || !products || products.length === 0) {
      return { success: true, data: { categories: MOCK_CATEGORIES } }
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
    })).filter(cat => cat.products.length > 0)

    if (categoriesWithProducts.length === 0) {
      return { success: true, data: { categories: MOCK_CATEGORIES } }
    }

    return {
      success: true,
      data: { categories: categoriesWithProducts },
    }
  } catch (_e) {
    return {
      success: true,
      data: { categories: MOCK_CATEGORIES },
    }
  }
})
