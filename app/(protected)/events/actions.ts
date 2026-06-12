'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as z from 'zod'

const eventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  event_type: z.string().min(1, 'Please select an event type'),
  start_time: z.string().min(1, 'Please specify start time'),
  end_time: z.string().min(1, 'Please specify end time'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  panchayat_id: z.string().uuid('Please select a valid panchayat'),
  ward_id: z.string().uuid('Please select a valid ward'),
})

export async function createEvent(data: z.infer<typeof eventSchema>) {
  const supabase = await createClient()

  // Validate session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('events').insert({
    ...data,
    created_by: user.id,
    status: 'Scheduled',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/events')
  redirect('/events')
}

export async function updateAttendance(attendanceList: {
  event_id: string
  member_id: string
  status: 'Registered' | 'Present' | 'Absent'
}[]) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const upsertRows = attendanceList.map((row) => ({
    event_id: row.event_id,
    member_id: row.member_id,
    status: row.status,
    marked_at: row.status !== 'Registered' ? new Date().toISOString() : null,
  }))

  const { error } = await supabase.from('event_attendance').upsert(upsertRows, {
    onConflict: 'event_id,member_id',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${attendanceList[0]?.event_id}`)
  return { success: true }
}
