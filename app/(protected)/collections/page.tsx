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

  // Fetch the default Kavaraipettai Panchayat details for Santhaa amount
  const { data: panchayat } = await supabase
    .from('panchayats')
    .select('default_santhaa_amount')
    .eq('name', 'Kavaraipettai')
    .maybeSingle()

  let defaultSanthaaAmount = panchayat?.default_santhaa_amount ? Number(panchayat.default_santhaa_amount) : 100

  if (!panchayat?.default_santhaa_amount) {
    const { data: allPanc } = await supabase
      .from('panchayats')
      .select('default_santhaa_amount')
      .limit(1)
    if (allPanc?.[0]?.default_santhaa_amount) {
      defaultSanthaaAmount = Number(allPanc[0].default_santhaa_amount)
    }
  }

  return (
    <div className="p-6">
      <CollectionsDashboard
        members={members || []}
        contributions={contributions || []}
        defaultSanthaaAmount={defaultSanthaaAmount}
      />
    </div>
  )
}
