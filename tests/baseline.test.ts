import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { formatRupiah } from '../utils/currency'
import { ORDER_TRANSITIONS } from '../utils/constants'
import { mapMidtransStatus } from '../server/utils/midtrans'
import { getSelectionError } from '../server/utils/price-calculator'

describe('shared baseline', () => {
  test('formats IDR and preserves the order state machine', () => {
    assert.match(formatRupiah(28_000), /28\.000/)
    assert.deepEqual(ORDER_TRANSITIONS.WAITING_PAYMENT, ['PAID', 'CANCELLED'])
    assert.deepEqual(ORDER_TRANSITIONS.READY, ['COMPLETED'])
  })

  test('maps terminal Midtrans statuses without treating unknown values as paid', () => {
    assert.equal(mapMidtransStatus('settlement'), 'PAID')
    assert.equal(mapMidtransStatus('deny'), 'FAILED')
    assert.equal(mapMidtransStatus('expire'), 'EXPIRED')
    assert.equal(mapMidtransStatus('unknown'), 'PENDING')
  })

  test('enforces required and single-choice modifier groups', () => {
    const groups = [{
      id: 'size', name: 'Ukuran', selection_type: 'SINGLE' as const,
      is_required: true, min_selections: 1, max_selections: 1,
    }]
    assert.equal(getSelectionError(groups, []), 'Ukuran wajib dipilih')
    assert.equal(getSelectionError(groups, ['size']), null)
    assert.equal(getSelectionError(groups, ['size', 'size']), 'Ukuran hanya boleh satu pilihan')
  })
})
