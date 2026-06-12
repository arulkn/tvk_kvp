import { createClient } from '@/lib/supabase/server'
import EventsList from './EventsList'

export default async function EventsPage() {
  const supabase = await createClient()

  // Fetch all events joining wards
  const { data: events = [] } = await supabase
    .from('events')
    .select('*, wards(*)')
    .is('deleted_at', null)
    .order('start_time', { ascending: true })

  // Fetch geographic options for dialog
  const { data: panchayats = [] } = await supabase
    .from('panchayats')
    .select('*')
    .order('name', { ascending: true })

  const { data: wards = [] } = await supabase
    .from('wards')
    .select('*')
    .order('number', { ascending: true })

  return (
    <div className="p-6">
      <EventsList
        events={events || []}
        panchayats={panchayats || []}
        wards={wards || []}
      />
    </div>
  )
}
