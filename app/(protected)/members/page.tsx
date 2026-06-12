import { createClient } from '@/lib/supabase/server'
import MembersTable from './MembersTable'

export default async function MembersPage() {
  const supabase = await createClient()

  // Fetch members with related metadata
  const { data: members = [] } = await supabase
    .from('members')
    .select('*, roles(*), villages(*), kilais(*), wards(*)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Fetch filters options
  const { data: roles = [] } = await supabase
    .from('roles')
    .select('*')
    .eq('is_active', true)
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

  return (
    <div className="p-6">
      <MembersTable
        initialMembers={members || []}
        roles={roles || []}
        villages={villages || []}
        kilais={kilais || []}
        wards={wards || []}
      />
    </div>
  )
}
