'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as z from 'zod'

const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  alternate_number: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  district_id: z.string().uuid('Please select a valid district'),
  union_id: z.string().uuid('Please select a valid union'),
  panchayat_id: z.string().uuid('Please select a valid panchayat'),
  village_id: z.string().uuid('Please select a valid village'),
  kilai_id: z.string().uuid('Please select a valid kilai'),
  ward_id: z.string().uuid('Please select a valid ward'),
  date_of_birth: z.string().optional(),
  occupation: z.string().optional(),
  joining_date: z.string().optional(),
  blood_group: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  role_id: z.string().uuid('Please select a valid role'),
  status: z.enum(['active', 'inactive', 'suspended']),
})

export async function createMember(data: z.infer<typeof memberSchema>) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Generate customized membership ID
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  const membership_id = `TVK-KAV-${randomNum}`

  const { error } = await supabase.from('members').insert({
    ...data,
    membership_id,
    date_of_birth: data.date_of_birth || null,
    joining_date: data.joining_date || new Date().toISOString().split('T')[0],
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/members')
  redirect('/members')
}

export async function updateMember(id: string, data: Partial<z.infer<typeof memberSchema>>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('members')
    .update({
      ...data,
      date_of_birth: data.date_of_birth || null,
      joining_date: data.joining_date || null,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/members/${id}`)
  revalidatePath('/members')
  return { success: true }
}

export async function transferMember(transferData: {
  memberId: string
  toKilaiId: string
  toWardId: string
  fromKilaiId: string
  fromWardId: string
  reason: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // 1. Log transfer record
  const { error: logError } = await supabase.from('member_transfers').insert({
    member_id: transferData.memberId,
    from_kilai_id: transferData.fromKilaiId,
    to_kilai_id: transferData.toKilaiId,
    from_ward_id: transferData.fromWardId,
    to_ward_id: transferData.toWardId,
    transferred_by: user.id,
    reason: transferData.reason,
  })

  if (logError) {
    return { error: logError.message }
  }

  // 2. Update member record
  const { error: updateError } = await supabase
    .from('members')
    .update({
      kilai_id: transferData.toKilaiId,
      ward_id: transferData.toWardId,
    })
    .eq('id', transferData.memberId)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath(`/members/${transferData.memberId}`)
  revalidatePath('/members')
  return { success: true }
}
