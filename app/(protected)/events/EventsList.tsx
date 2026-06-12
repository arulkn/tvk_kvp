'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  Tag
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EVENT_TYPES } from '@/constants'
import { createEvent } from './actions'

interface EventsListProps {
  events: any[]
  panchayats: any[]
  wards: any[]
}

export default function EventsList({ events, panchayats, wards }: EventsListProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState(EVENT_TYPES[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [panchayatId, setPanchayatId] = useState(panchayats[0]?.id || '')
  const [wardId, setWardId] = useState(wards[0]?.id || '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !startTime || !endTime || !location) {
      setError('Please fill in all required fields.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const res = await createEvent({
        title,
        description,
        event_type: eventType,
        start_time: startTime,
        end_time: endTime,
        location,
        panchayat_id: panchayatId,
        ward_id: wardId,
      })

      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        setOpen(false)
        setTitle('')
        setDescription('')
        setStartTime('')
        setEndTime('')
        setLocation('')
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Organization Events</h1>
          <p className="text-slate-400 text-sm">
            Schedule meetings, welfare camps, protests, and coordinate member participation.
          </p>
        </div>

        {/* Schedule Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none h-8 gap-1.5 px-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold hover:scale-[1.02] cursor-pointer shadow-md">
            <Plus className="w-4 h-4" /> Schedule Event
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-extrabold text-xl">Schedule Panchayat Activity</DialogTitle>
              <DialogDescription className="text-slate-400">
                Plan and publish party drives, booths, or public meetings.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Event Title *</Label>
                <Input
                  placeholder="e.g. Booth Committee Mobilization"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Event Type *</Label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Location *</Label>
                  <Input
                    placeholder="e.g. Community Hall"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">End Time *</Label>
                  <Input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Target Panchayat</Label>
                  <select
                    value={panchayatId}
                    onChange={(e) => setPanchayatId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {panchayats.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-300 font-bold text-xs uppercase">Target Ward</Label>
                  <select
                    value={wardId}
                    onChange={(e) => setWardId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:border-amber-500 focus:outline-none"
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        Ward {w.number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 font-bold text-xs uppercase">Description / Agenda</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the agenda of this meeting..."
                  className="w-full h-20 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>Publish Activity</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const formattedDate = new Date(event.start_time).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const formattedTime = new Date(event.start_time).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={event.id}
                className="bg-slate-900/10 border border-slate-900 rounded-xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                      <Tag className="w-3 h-3" /> {event.event_type}
                    </span>
                    <Badge variant="outline" className="border-amber-500/25 bg-amber-500/10 text-amber-400 text-[10px]">
                      {event.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-900/70 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-300">{formattedDate}</p>
                      <p className="text-[10px] text-slate-500">{formattedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-300 truncate max-w-[120px]">{event.location}</p>
                      <p className="text-[10px] text-slate-500">Ward {event.wards?.number || '-'}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/events/${event.id}`}
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    "w-full mt-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 inline-flex items-center justify-center rounded-lg text-sm font-semibold"
                  )}
                >
                  Manage Attendance <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )
          })
        ) : (
          <div className="md:col-span-2 text-center py-16 border border-dashed border-slate-800 rounded-2xl text-slate-500">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-400">No scheduled events found.</p>
            <p className="text-xs text-slate-500 mt-1">Publish an activity to begin tracking cadre attendance.</p>
          </div>
        )}
      </div>
    </div>
  )
}
