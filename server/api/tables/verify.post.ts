// ============================================================
// POST /api/tables/verify — Verify QR table token
// ============================================================

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.table_number || !body?.token) {
    throw createError({ statusCode: 400, message: 'table_number dan token wajib diisi' })
  }

  const supabase = useSupabaseAdmin()

  const { data: table, error } = await supabase
    .from('tables')
    .select('id, table_number, branch_id, status')
    .eq('table_number', body.table_number)
    .eq('qr_token', body.token)
    .single()

  if (error || !table) {
    throw createError({
      statusCode: 404,
      statusMessage: 'QR meja sudah tidak berlaku. Silakan minta bantuan staff.',
    })
  }

  if (table.status === 'DISABLED') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Meja ini sedang tidak aktif.',
    })
  }

  return {
    success: true,
    data: {
      table_id: table.id,
      table_number: table.table_number,
      branch_id: table.branch_id,
    },
  }
})
