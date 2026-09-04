import { describe, expect, test } from 'bun:test'
import { formatRupiah } from '../utils/currency'
import { ORDER_TRANSITIONS } from '../utils/constants'
import { mapMidtransStatus } from '../server/utils/midtrans'
import { getSelectionError } from '../server/utils/price-calculator'

describe('shared baseline', () => {
  test('formats IDR and preserves the order state machine', () => {
    expect(formatRupiah(28_000)).toContain('28.000')
    expect(ORDER_TRANSITIONS.WAITING_PAYMENT).toEqual(['PAID', 'CANCELLED'])
    expect(ORDER_TRANSITIONS.READY).toEqual(['COMPLETED'])
  })

  test('maps terminal Midtrans statuses without treating unknown values as paid', () => {
    expect(mapMidtransStatus('settlement')).toBe('PAID')
    expect(mapMidtransStatus('deny')).toBe('FAILED')
    expect(mapMidtransStatus('expire')).toBe('EXPIRED')
    expect(mapMidtransStatus('unknown')).toBe('PENDING')
  })

  test('enforces required and single-choice modifier groups', () => {
    const groups = [{
      id: 'size', name: 'Ukuran', selection_type: 'SINGLE' as const,
      is_required: true, min_selections: 1, max_selections: 1,
    }]
    expect(getSelectionError(groups, [])).toBe('Ukuran wajib dipilih')
    expect(getSelectionError(groups, ['size'])).toBeNull()
    expect(getSelectionError(groups, ['size', 'size'])).toBe('Ukuran hanya boleh satu pilihan')
  })
})
