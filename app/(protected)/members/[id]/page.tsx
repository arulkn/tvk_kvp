import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MemberProfile from './MemberProfile'

interface MemberPageProps {
  params: Promise<{ id: string }>
}

export default async function MemberDetailPage({ params }: MemberPageProps) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch detailed member profile
  const { data: member } = await supabase
    .from('members')
    .select('*, roles(*), villages(*), kilais(*), wards(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!member) {
    notFound()
  }

  // 2. Fetch transfer history
  const { data: transfers = [] } = await supabase
    .from('member_transfers')
    .select('*, to_kilais:to_kilai_id(*), to_wards:to_ward_id(*), users(*)')
    .eq('member_id', id)
    .order('created_at', { ascending: false })

  // 3. Fetch location options for transfer wizard
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
      <MemberProfile
        member={member}
        transfers={transfers || []}
        kilais={kilais || []}
        wards={wards || []}
      />
    </div>
  )
}
