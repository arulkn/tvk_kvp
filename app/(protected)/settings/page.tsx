import { createClient } from '@/lib/supabase/server'
import SettingsTabs from './SettingsTabs'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Fetch roles
  const { data: roles = [] } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })

  // Fetch villages
  const { data: villages = [] } = await supabase
    .from('villages')
    .select('*')
    .order('name', { ascending: true })

  // Fetch kilais with their parent village name
  const { data: kilais = [] } = await supabase
    .from('kilais')
    .select('*, villages(name)')
    .order('name', { ascending: true })

  // Fetch wards with their parent kilai name
  const { data: wards = [] } = await supabase
    .from('wards')
    .select('*, kilais(name)')
    .order('number', { ascending: true })

  // Fetch the default Kavaraipettai Panchayat ID
  const { data: panchayat } = await supabase
    .from('panchayats')
    .select('id')
    .eq('name', 'Kavaraipettai')
    .maybeSingle()

  let panchayatId = panchayat?.id
  if (!panchayatId) {
    const { data: allPanc } = await supabase
      .from('panchayats')
      .select('id')
      .limit(1)
    panchayatId = allPanc?.[0]?.id || ''
  }

  return (
    <div className="p-6">
      <SettingsTabs
        roles={roles || []}
        villages={villages || []}
        kilais={kilais || []}
        wards={wards || []}
        panchayatId={panchayatId}
      />
    </div>
  )
}
