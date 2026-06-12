import { createClient } from '@/lib/supabase/server'
import {
  Users,
  AlertTriangle,
  Calendar,
  IndianRupee,
  TrendingUp,
  MapPin,
  CheckCircle,
  Plus,
  ArrowUpRight
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type UpcomingEvent = {
  id: string
  title: string
  location: string
  start_time: string
  event_type: string
}

type ScopeData = {
  districtName: string
  unionName: string
  panchayatName: string
  wardsCount: number
  kilaisCount: number
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    startDate: start.toISOString().slice(0, 10),
    nextDate: next.toISOString().slice(0, 10),
  }
}

function formatEventDay(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(new Date(value))
}

function formatEventMonth(value: string) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(value))
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { startDate, nextDate } = getCurrentMonthRange()

  const [
    totalMembersResult,
    activeMembersResult,
    openComplaintsResult,
    upcomingEventsCountResult,
    monthlyPaymentsResult,
    upcomingEventsResult,
    districtsResult,
    unionsResult,
    panchayatsResult,
    wardsResult,
    kilaisResult,
  ] = await Promise.all([
    supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('status', ['New', 'Assigned', 'In Progress', 'Escalated'])
      .is('deleted_at', null),
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Scheduled')
      .gte('start_time', new Date().toISOString())
      .is('deleted_at', null),
    supabase
      .from('contributions_santhaa')
      .select('amount')
      .gte('month', startDate)
      .lt('month', nextDate)
      .is('deleted_at', null),
    supabase
      .from('events')
      .select('id, title, location, start_time, event_type')
      .eq('status', 'Scheduled')
      .gte('start_time', new Date().toISOString())
      .is('deleted_at', null)
      .order('start_time', { ascending: true })
      .limit(3),
    supabase
      .from('districts')
      .select('name')
      .order('name', { ascending: true })
      .limit(1),
    supabase
      .from('unions')
      .select('name')
      .order('name', { ascending: true })
      .limit(1),
    supabase
      .from('panchayats')
      .select('name')
      .order('name', { ascending: true })
      .limit(1),
    supabase
      .from('wards')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('kilais')
      .select('*', { count: 'exact', head: true }),
  ])

  const dashboardErrors = [
    totalMembersResult.error,
    activeMembersResult.error,
    openComplaintsResult.error,
    upcomingEventsCountResult.error,
    monthlyPaymentsResult.error,
    upcomingEventsResult.error,
    districtsResult.error,
    unionsResult.error,
    panchayatsResult.error,
    wardsResult.error,
    kilaisResult.error,
  ].filter(Boolean)

  const totalMembers = totalMembersResult.count || 0
  const activeMembers = activeMembersResult.count || 0
  const activeRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0
  const monthlyCollection = monthlyPaymentsResult.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  const upcomingEvents = (upcomingEventsResult.data || []) as UpcomingEvent[]

  const stats = {
    totalMembers,
    activeMembers,
    pendingComplaints: openComplaintsResult.count || 0,
    upcomingEvents: upcomingEventsCountResult.count || 0,
    collections: monthlyCollection,
  }

  const scope: ScopeData = {
    districtName: districtsResult.data?.[0]?.name || 'Not configured',
    unionName: unionsResult.data?.[0]?.name || 'Not configured',
    panchayatName: panchayatsResult.data?.[0]?.name || 'Not configured',
    wardsCount: wardsResult.count || 0,
    kilaisCount: kilaisResult.count || 0,
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Panchayat Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back to the Tamizhaga Vettri Kazhagam local party administration desk.
          </p>
        </div>
        {dashboardErrors.length > 0 && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            Some dashboard data could not be loaded. Check Supabase RLS policies.
          </div>
        )}
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cadre</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.totalMembers}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live member records</span>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Status</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.activeMembers}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>{activeRate}% active cadre rate</span>
          </div>
        </div>

        {/* Pending Grievances */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.pendingComplaints}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-500">
            <span>Needs assignment & resolution</span>
          </div>
        </div>

        {/* Monthly Santhaa Collections */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-5 hover:border-slate-800/80 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Santhaa Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{stats.collections.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
            <span>For current month</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events & Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-white">Upcoming Events</h3>
              <Link href="/events" className="text-xs text-amber-500 font-bold hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded flex flex-col items-center justify-center text-xs font-bold font-mono ${
                        index % 2 === 0 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        <span>{formatEventDay(event.start_time)}</span>
                        <span className="text-[9px] uppercase">{formatEventMonth(event.start_time)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-600 shrink-0" /> {event.location}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 shrink-0">
                      {formatEventTime(event.start_time)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No upcoming scheduled events found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action center / Quick shortcuts */}
        <div className="space-y-6">
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Quick Tasks</h3>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/members"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "w-full justify-start gap-2 bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold py-2.5 rounded-lg shadow hover:opacity-95"
                )}
              >
                <Plus className="w-4 h-4" /> Add New Cadre Member
              </Link>
              <Link
                href="/complaints"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  "w-full justify-start gap-2 border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold py-2.5 rounded-lg"
                )}
              >
                <AlertTriangle className="w-4 h-4" /> File Citizen Complaint
              </Link>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-white">Administrative Scope</h3>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/55">
                <span>District</span>
                <span className="text-white font-semibold">{scope.districtName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/55">
                <span>Union / Block</span>
                <span className="text-white font-semibold">{scope.unionName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/55">
                <span>Panchayat</span>
                <span className="text-white font-semibold">{scope.panchayatName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Wards / Kilais</span>
                <span className="text-white font-semibold">{scope.wardsCount} Wards / {scope.kilaisCount} Kilais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
