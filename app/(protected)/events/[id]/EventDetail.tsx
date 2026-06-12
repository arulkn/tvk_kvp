'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  Users
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateAttendance } from '../actions'

interface EventDetailProps {
  event: any
  members: any[]
  initialAttendance: any[]
}

export default function EventDetail({
  event,
  members,
  initialAttendance,
}: EventDetailProps) {
  const router = useRouter()
  const [attendance, setAttendance] = useState<{ [memberId: string]: 'Registered' | 'Present' | 'Absent' }>(
    () => {
      const mapping: { [memberId: string]: 'Registered' | 'Present' | 'Absent' } = {}
      // Initialize with fetched attendance
      initialAttendance.forEach((att) => {
        mapping[att.member_id] = att.status
      })
      // Fill missing members as Registered by default
      members.forEach((m) => {
        if (!mapping[m.id]) {
          mapping[m.id] = 'Registered'
        }
      })
      return mapping
    }
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Filter members list for search matching
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = (memberId: string, status: 'Registered' | 'Present' | 'Absent') => {
    setAttendance((prev) => ({
      ...prev,
      [memberId]: status,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    const payload = Object.entries(attendance).map(([memberId, status]) => ({
      event_id: event.id,
      member_id: memberId,
      status,
    }))

    try {
      const res = await updateAttendance(payload)
      if (res && res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        router.refresh()
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
      setIsLoading(false)
    }
  }

  const formattedDate = new Date(event.start_time).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedTime = `${new Date(event.start_time).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })} - ${new Date(event.end_time).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`

  // Calculate statistics
  const presentCount = Object.values(attendance).filter((s) => s === 'Present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'Absent').length
  const registeredCount = Object.values(attendance).filter((s) => s === 'Registered').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              "text-slate-400 hover:text-white rounded-full"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">{event.title}</h1>
            <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">{event.event_type}</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Attendance
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Info and Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Meta */}
        <div className="md:col-span-2 bg-slate-900/20 border border-slate-900 p-5 rounded-xl space-y-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Event Information</h3>
          {event.description && <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* Quick Counts */}
        <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-xl flex flex-col justify-between">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-3">Attendance Stats</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
              <p className="text-xl font-black text-green-400">{presentCount}</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">Present</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <p className="text-xl font-black text-red-400">{absentCount}</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">Absent</p>
            </div>
            <div className="bg-slate-800/20 border border-slate-800 p-2.5 rounded-lg">
              <p className="text-xl font-black text-slate-400">{registeredCount}</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">Pending</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-3">
            Click save to finalize these logs in the database.
          </div>
        </div>
      </div>

      {/* Attendance Checklist Directory */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" /> Cadre Checklist
          </h3>
          <div className="relative w-64">
            <Input
              placeholder="Search member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-100 h-8"
            />
          </div>
        </div>

        <div className="border border-slate-900 bg-slate-900/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950/50 border-b border-slate-900">
              <TableRow className="hover:bg-transparent border-slate-900">
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Membership ID</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Name</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs">Ward / Kilai</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-xs text-right">Attendance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const currentStatus = attendance[member.id] || 'Registered'

                  return (
                    <TableRow key={member.id} className="hover:bg-slate-900/30 border-slate-900/50">
                      <TableCell className="font-mono text-xs font-bold text-amber-500">{member.membership_id}</TableCell>
                      <TableCell className="font-semibold text-white">{member.name}</TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {member.wards?.name || `Ward ${member.wards?.number}`} / {member.kilais?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1.5 p-0.5 rounded-lg border border-slate-800 bg-slate-950/40">
                          {/* Present */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'Present')}
                            type="button"
                            className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase px-2 py-1.5 rounded-md transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-green-500 text-slate-950'
                                : 'text-slate-500 hover:text-green-400'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Present
                          </button>

                          {/* Absent */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'Absent')}
                            type="button"
                            className={`inline-flex items-center justify-center gap-1 text-[10px] font-bold uppercase px-2 py-1.5 rounded-md transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-red-500 text-slate-950'
                                : 'text-slate-500 hover:text-red-400'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>

                          {/* Pending */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'Registered')}
                            type="button"
                            className={`inline-flex items-center justify-center text-[10px] font-bold uppercase px-2 py-1.5 rounded-md transition-all ${
                              currentStatus === 'Registered'
                                ? 'bg-slate-800 text-white'
                                : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            Pending
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    No members match the search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
