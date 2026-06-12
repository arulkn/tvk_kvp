import { createClient } from '@/lib/supabase/server'
import CollectionsDashboard from './CollectionsDashboard'

export default async function CollectionsPage() {
  const supabase = await createClient()

  // Fetch all members with their geographic details
  const { data: members = [] } = await supabase
    .from('members')
    .select('*, wards(*), kilais(*)')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  // Fetch all subscription payments / contributions
  const { data: contributions = [] } = await supabase
    .from('contributions_santhaa')
    .select('*')
    .is('deleted_at', null)
    .order('payment_date', { ascending: false })

  return (
    <div className="p-6">
      <CollectionsDashboard
        members={members || []}
        contributions={contributions || []}
      />
    </div>
  )
}
