'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function normalizeRoleCode(code: string) {
  return code.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function refreshSettingsPaths() {
  revalidatePath('/settings')
  revalidatePath('/members')
  revalidatePath('/members/new')
  revalidatePath('/dashboard')
  revalidatePath('/collections')
}

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
  const formattedCode = normalizeRoleCode(data.code)

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

  refreshSettingsPaths()
  return { success: true }
}

export async function updateRole(
  id: string,
  data: {
    code: string
    name: string
    name_ta?: string
    description?: string
    is_active?: boolean
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const formattedCode = normalizeRoleCode(data.code)
  if (!formattedCode) {
    return { error: 'Role code is required.' }
  }

  const { error } = await supabase
    .from('roles')
    .update({
      code: formattedCode,
      name: data.name,
      name_ta: data.name_ta || null,
      description: data.description || null,
      is_active: data.is_active ?? true,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function deleteRole(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: role } = await supabase
    .from('roles')
    .select('code')
    .eq('id', id)
    .maybeSingle()

  if (role?.code === 'super_admin') {
    return { error: 'Super Administrator role cannot be deleted.' }
  }

  const { error } = await supabase.from('roles').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
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

  refreshSettingsPaths()
  return { success: true }
}

export async function updateVillage(
  id: string,
  data: {
    name: string
    name_ta?: string
    panchayatId?: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('villages')
    .update({
      name: data.name,
      name_ta: data.name_ta || null,
      ...(data.panchayatId ? { panchayat_id: data.panchayatId } : {}),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function deleteVillage(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('villages').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
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

  refreshSettingsPaths()
  return { success: true }
}

export async function updateKilai(
  id: string,
  data: {
    name: string
    name_ta?: string
    villageId: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('kilais')
    .update({
      name: data.name,
      name_ta: data.name_ta || null,
      village_id: data.villageId,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function deleteKilai(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('kilais').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
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

  refreshSettingsPaths()
  return { success: true }
}

export async function updateWard(
  id: string,
  data: {
    number: number
    name?: string
    name_ta?: string
    kilaiId: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('wards')
    .update({
      number: data.number,
      name: data.name || `Ward ${data.number}`,
      name_ta: data.name_ta || null,
      kilai_id: data.kilaiId,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function deleteWard(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('wards').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function updatePanchayatSettings(
  panchayatId: string,
  data: {
    defaultSanthaaAmount: number
  }
) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('panchayats')
    .update({
      default_santhaa_amount: data.defaultSanthaaAmount
    })
    .eq('id', panchayatId)

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}

export async function updateUserRole(userId: string, roleId: string) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify caller is super admin
  const { data: callerRole } = await supabase
    .from('user_roles')
    .select('roles(code)')
    .eq('user_id', user.id)
    .maybeSingle()

  const callerRoleCode = (callerRole as any)?.roles?.code
  if (callerRoleCode !== 'super_admin') {
    return { error: 'Unauthorized: Only super administrators can modify portal roles.' }
  }

  // Prevent lockout: caller cannot modify their own role
  if (userId === user.id) {
    return { error: 'You cannot modify your own role to prevent system lockout.' }
  }

  // Delete all existing roles for this user
  await supabase.from('user_roles').delete().eq('user_id', userId)

  // Insert the new role
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role_id: roleId })

  if (error) {
    return { error: error.message }
  }

  refreshSettingsPaths()
  return { success: true }
}
