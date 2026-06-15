import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MemberForm from '../../new/MemberForm'

interface EditMemberPageProps {
  params: Promise<{ id: string }>
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch detailed member details
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!member) {
    notFound()
  }

  // 2. Fetch geographic and role options
  const { data: districts = [] } = await supabase
    .from('districts')
    .select('*')
    .order('name', { ascending: true })

  const { data: unions = [] } = await supabase
    .from('unions')
    .select('*')
    .order('name', { ascending: true })

  const { data: panchayats = [] } = await supabase
    .from('panchayats')
    .select('*')
    .order('name', { ascending: true })

  const { data: villages = [] } = await supabase
    .from('villages')
    .select('*')
    .order('name', { ascending: true })

  const { data: kilais = [] } = await supabase
    .from('kilais')
    .select('*')
    .order('name', { ascending: true })

  const { data: wards = [] } = await supabase
    .from('wards')
    .select('*')
    .order('number', { ascending: true })

  const { data: roles = [] } = await supabase
    .from('roles')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="p-6">
      <MemberForm
        districts={districts || []}
        unions={unions || []}
        panchayats={panchayats || []}
        villages={villages || []}
        kilais={kilais || []}
        wards={wards || []}
        roles={roles || []}
        member={member}
      />
    </div>
  )
}
