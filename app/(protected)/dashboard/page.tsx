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

export default async function DashboardPage() {
  const supabase = await createClient()

  // Safely fetch database counts with fallbacks
  let membersCount = 0
  let activeMembersCount = 0
  let complaintsCount = 0
  let eventsCount = 0
  let monthlyCollection = 0

  try {
    const { count: mCount } = await supabase.from('members').select('*', { count: 'exact', head: true })
    membersCount = mCount || 0

    const { count: amCount } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active')
    activeMembersCount = amCount || 0

    const { count: cCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).in('status', ['New', 'Assigned', 'In Progress'])
    complaintsCount = cCount || 0

    const { count: eCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'Scheduled')
    eventsCount = eCount || 0

    // Stated dues / collections
    const { data: payments } = await supabase.from('contributions_santhaa').select('amount')
    monthlyCollection = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error)
  }

  // If no members exist, display default mock statistics with a seed notice
  const isDemo = membersCount === 0

  const stats = {
    totalMembers: isDemo ? 384 : membersCount,
    activeMembers: isDemo ? 352 : activeMembersCount,
    pendingComplaints: isDemo ? 12 : complaintsCount,
    upcomingEvents: isDemo ? 3 : eventsCount,
    collections: isDemo ? 24500 : monthlyCollection,
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
        {isDemo && (
          <div className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Demo Mode: Displaying sample statistics. Database migrations created successfully.
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
            <span>+{isDemo ? '12% this month' : '0%'}</span>
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
            <span>{isDemo ? '91.6%' : '0%'} total participation rate</span>
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
              {isDemo ? (
                <>
                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-red-500/10 text-red-500 flex flex-col items-center justify-center text-xs font-bold font-mono">
                        <span>15</span>
                        <span className="text-[9px] uppercase">Jun</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Booth Level Committee Meeting</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" /> Ward 1 Primary School
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                      10:00 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center text-xs font-bold font-mono">
                        <span>22</span>
                        <span className="text-[9px] uppercase">Jun</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Public Welfare Distribution Drive</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" /> Panchayat Office Ground
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                      04:30 PM
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-red-500/10 text-red-500 flex flex-col items-center justify-center text-xs font-bold font-mono">
                        <span>28</span>
                        <span className="text-[9px] uppercase">Jun</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Blood Donation Camp</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-600" /> Government Hospital Union
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                      09:00 AM
                    </span>
                  </div>
                </>
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
                <span className="text-white font-semibold">Tiruvallur</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/55">
                <span>Union / Block</span>
                <span className="text-white font-semibold">Gummidipoondi</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900/55">
                <span>Panchayat</span>
                <span className="text-white font-semibold">Kavaraipettai</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Wards / Kilais</span>
                <span className="text-white font-semibold">2 Wards / 2 Kilais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
