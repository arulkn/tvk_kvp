'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as z from 'zod'

const contributionSchema = z.object({
  memberId: z.string().uuid('Please select a valid member'),
  amount: z.number().min(1, 'Amount must be at least ₹1'),
  month: z.string().min(7, 'Please select a valid month'), // Stored as YYYY-MM
  paymentDate: z.string().min(10, 'Please select payment date'),
  remarks: z.string().optional(),
})

export async function recordContribution(data: z.infer<typeof contributionSchema>) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Format month to YYYY-MM-01
  const formattedMonth = `${data.month}-01`

  // 1. Insert contribution record
  const { data: contrib, error: contribError } = await supabase
    .from('contributions_santhaa')
    .insert({
      member_id: data.memberId,
      amount: data.amount,
      month: formattedMonth,
      payment_date: data.paymentDate,
      collector_id: user.id,
      remarks: data.remarks || null,
    })
    .select()
    .single()

  if (contribError) {
    return { error: contribError.message }
  }

  // 2. Fetch default cash account (Panchayat Main Cash Chest)
  const { data: account } = await supabase
    .from('accounts')
    .select('id, balance')
    .eq('name', 'Panchayat Main Cash Chest')
    .single()

  if (account) {
    // 3. Update account balance
    const newBalance = Number(account.balance) + data.amount
    await supabase.from('accounts').update({ balance: newBalance }).eq('id', account.id)

    // 4. Log transaction in financial journal
    await supabase.from('transactions').insert({
      account_id: account.id,
      type: 'Income',
      category: 'Santhaa Collection',
      amount: data.amount,
      description: `Santhaa collection for month ${data.month}`,
      transaction_date: data.paymentDate,
      recorded_by: user.id,
      link_id: contrib.id,
    })
  }

  revalidatePath('/collections')
  revalidatePath('/accounts')
  revalidatePath('/dashboard')
  return { success: true, contributionId: contrib.id }
}
