'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addRole(data: {
  code: string
  name: string
  name_ta?: string
  description?: string
}) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Format code to lowercase snake_case
  const formattedCode = data.code.toLowerCase().replace(/[^a-z0-9]/g, '_')

  const { error } = await supabase.from('roles').insert({
    code: formattedCode,
    name: data.name,
    name_ta: data.name_ta || null,
    description: data.description || null,
    is_active: true,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/members/new')
  return { success: true }
}

export async function addVillage(data: {
  name: string
  name_ta?: string
  panchayatId: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('villages').insert({
    name: data.name,
    name_ta: data.name_ta || null,
    panchayat_id: data.panchayatId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/members/new')
  return { success: true }
}

export async function addKilai(data: {
  name: string
  name_ta?: string
  villageId: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('kilais').insert({
    name: data.name,
    name_ta: data.name_ta || null,
    village_id: data.villageId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/members/new')
  return { success: true }
}

export async function addWard(data: {
  number: number
  name?: string
  name_ta?: string
  kilaiId: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('wards').insert({
    number: data.number,
    name: data.name || `Ward ${data.number}`,
    name_ta: data.name_ta || `வார்டு ${data.number}`,
    kilai_id: data.kilaiId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/members/new')
  return { success: true }
}
