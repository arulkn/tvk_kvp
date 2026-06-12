import { createClient } from '@/lib/supabase/server'
import MemberForm from './MemberForm'

export default async function NewMemberPage() {
  const supabase = await createClient()

  // Fetch geographic options
  const { data: districts = [] } = await supabase.from('districts').select('*').order('name', { ascending: true })
  const { data: unions = [] } = await supabase.from('unions').select('*').order('name', { ascending: true })
  const { data: panchayats = [] } = await supabase.from('panchayats').select('*').order('name', { ascending: true })
  const { data: villages = [] } = await supabase.from('villages').select('*').order('name', { ascending: true })
  const { data: kilais = [] } = await supabase.from('kilais').select('*').order('name', { ascending: true })
  const { data: wards = [] } = await supabase.from('wards').select('*').order('number', { ascending: true })

  // Fetch roles
  const { data: roles = [] } = await supabase.from('roles').select('*').eq('is_active', true).order('name', { ascending: true })

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
      />
    </div>
  )
}
