import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EventDetail from './EventDetail'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch event detailed profile
  const { data: event } = await supabase
    .from('events')
    .select('*, wards(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!event) {
    notFound()
  }

  // 2. Fetch all active members in the organization to check off attendance
  const { data: members = [] } = await supabase
    .from('members')
    .select('*, wards(*), kilais(*)')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  // 3. Fetch existing attendance logs
  const { data: attendance = [] } = await supabase
    .from('event_attendance')
    .select('*')
    .eq('event_id', id)

  return (
    <div className="p-6">
      <EventDetail
        event={event}
        members={members || []}
        initialAttendance={attendance || []}
      />
    </div>
  )
}
