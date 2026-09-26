import { z } from 'zod'
import { fetchLiveQuotes } from '../../../src/services/providers/registry'

const requestSchema = z.object({
  fromCountryId: z.string().length(2),
  toCountryId: z.string().length(2),
  sendAmount: z.number().finite().positive(),
  sendCurrency: z.string().length(3),
  receiveCurrency: z.string().length(3),
  paymentMethod: z.enum(['bank_transfer', 'bank_wire', 'debit_card', 'credit_card', 'cash']).optional(),
  receivingMethod: z.enum(['bank_deposit', 'cash_pickup', 'mobile_wallet']).optional(),
})

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return Response.json({ status: 'invalid_request', errors: parsed.error.flatten() }, { status: 400 })
  }

  const result = await fetchLiveQuotes(parsed.data)
  return result.status === 'available'
    ? Response.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
    : Response.json(result, { status: 503, headers: { 'Cache-Control': 'private, no-store' } })
}